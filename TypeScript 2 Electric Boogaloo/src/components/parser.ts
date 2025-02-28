import {
  alt,
  apply,
  combine,
  kleft,
  kright,
  opt,
  Parser,
  rep_sc,
  Rule,
  seq,
  str,
  tok,
  Token,
} from "typescript-parsec";
import { buildLexer, expectEOF, expectSingleResult } from "typescript-parsec";
import { TreeNode } from "../structures/tree_node";
import { SemanticState } from "../structures/semantic_state";
import { builtins, Word } from "./lexicon";
import { NodeLabel, nodeTypes, TokenKind } from "../structures/pieces";

export { evaluate, nodeTypes };

// SET TOKEN RECOGNIZERS
const lexer = buildLexer([
  [true, /^[0-9]*/g, TokenKind.Numeric],
  [true, /^[a-zA-Z]*/g, TokenKind.Alpha],
  [true, /^ /g, TokenKind.Space],
  [true, /^\n/g, TokenKind.NewLine],
  [true, /^['"]/g, TokenKind.Quote],
  [true, /^./g, TokenKind.Other],
]);

const everestScope = new SemanticState();
builtins.forEach((word: Word<any>) => everestScope.addWord(word));

let DEBUG: boolean = false;

function pattern<T>(
  parser: Rule<TokenKind, T>,
  pattern: Parser<TokenKind, any>,
  debugFx?: (node: T) => string
) {
  parser.setPattern(
    apply(pattern, (node: T) => {
      if (DEBUG && debugFx != undefined) console.log(debugFx(node));
      return node;
    })
  );
}

pattern(
  nodeTypes.SENTENCE,
  combine(nodeTypes.VERB, (verb: TreeNode<any>) => {
    return verb.getArguments();
  })
);

pattern(
  nodeTypes.LITERAL,
  apply(
    alt(nodeTypes.NUMERIC_LITERAL, nodeTypes.STRING_LITERAL),
    (value: string | number) =>
      new TreeNode(NodeLabel.Literal, (state: SemanticState) => value)
  ),
  (node: TreeNode<any>) => node.getValue().toString()
);

pattern(
  nodeTypes.NUMERIC_LITERAL,
  apply(
    seq(
      rep_sc(tok(TokenKind.Numeric)),
      opt(kright(str("."), rep_sc(tok(TokenKind.Numeric))))
    ),
    (
      numberParts: [
        Token<TokenKind.Numeric>[],
        Token<TokenKind.Numeric>[] | undefined,
      ]
    ) =>
      Number(
        mapTokenArrayToString(numberParts[0]) +
          (numberParts[1] != undefined
            ? "." + mapTokenArrayToString(numberParts[1])
            : "")
      )
  ),
  (node: number) => node.toString()
);

pattern(
  nodeTypes.STRING_LITERAL,
  apply(
    //Take in first quote
    combine(tok(TokenKind.Quote), (quote: Token<TokenKind.Quote>) => {
      return kleft(
        rep_sc(
          //Allow other kind of quote
          alt(nodeTypes.STRING_CHARACTER, str(quote.text == "'" ? '"' : "'"))
        ),
        //Take in second quote
        str(quote.text)
      );
    }),
    (stringLit: Token<any>[]) => {
      const result = mapTokenArrayToString(stringLit);
      console.debug(`THE RESULT SHOULD BE '${result}'`);
      return result;
    }
  ),
  (node: string) => node
);

pattern(
  nodeTypes.STRING_CHARACTER,
  alt(tok(TokenKind.Alpha), tok(TokenKind.Numeric), tok(TokenKind.Space)),
  (node: Token<TokenKind>) => node.text
);

function evaluate<T>(nodeType: Rule<any, T>, expr: string, debug?: boolean): T {
  DEBUG = debug == undefined ? false : debug;
  const parseResult = expectSingleResult(
    expectEOF(nodeType.parse(lexer.parse(expr)))
  );
  if (parseResult instanceof TreeNode) {
    parseResult.assignState(everestScope);
  }
  return parseResult;
}

function mapTokenArrayToString(tokenArray: Token<any>[]): string {
  return tokenArray.map((value: Token<any>) => value.text).join("");
}
