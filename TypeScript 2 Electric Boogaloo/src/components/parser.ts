import {
  alt,
  apply,
  combine,
  kleft,
  kright,
  opt,
  Parser,
  ParserOutput,
  rep_sc,
  Rule,
  seq,
  str,
  tok,
  Token,
} from "typescript-parsec";
import {
  buildLexer,
  expectEOF,
  expectSingleResult,
  rule,
} from "typescript-parsec";
import { TreeNode } from "../structures/tree_node";
import { SemanticState } from "../structures/semantic_state";

export { evaluate, nodeTypes };

enum TokenKind {
  Numeric,
  Alpha,
  Space,
  NewLine,
  Quote,
  Other,
}

// DEFINE TOKEN TYPES
const lexer = buildLexer([
  [true, /^[0-9]*/g, TokenKind.Numeric],
  [true, /^[a-zA-Z]*/g, TokenKind.Alpha],
  [true, /^ /g, TokenKind.Space],
  [true, /^\n/g, TokenKind.NewLine],
  [true, /^['"]/g, TokenKind.Quote],
  [true, /^./g, TokenKind.Other],
]);

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

// DEFINE NON_TERMINAL TYPES
//const NONTERMINAL = rule<TokenKind, ruleOutput>();
const nodeTypes = {
  PRGM: rule<TokenKind, any>(),
  LITERAL: rule<TokenKind, TreeNode>(),
  NUMERIC_LITERAL: rule<TokenKind, number>(),
  STRING_LITERAL: rule<TokenKind, string>(),
  STRING_CHARACTER: rule<TokenKind, Token<TokenKind>>(),
};

pattern(
  nodeTypes.LITERAL,
  apply(
    alt(nodeTypes.NUMERIC_LITERAL, nodeTypes.STRING_LITERAL),
    (value: string | number) =>
      new TreeNode("Literal", (state: SemanticState) => value)
  ),
  (node: TreeNode) => node.getValue().toString()
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
  return expectSingleResult(expectEOF(nodeType.parse(lexer.parse(expr))));
}

function mapTokenArrayToString(tokenArray: Token<any>[]): string {
  return tokenArray.map((value: Token<any>) => value.text).join("");
}
