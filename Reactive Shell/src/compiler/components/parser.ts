import {
  apply,
  expectEOF,
  expectSingleResult,
  Parser,
  Rule,
} from "typescript-parsec";
import { lexer, TokenKind } from "../header";

export { evaluate, pattern };

let DEBUG: boolean = false;

function pattern<T>(
  parser: Rule<TokenKind, T>,
  pattern: Parser<TokenKind, T>,
  debugFx?: (node: T) => string
) {
  parser.setPattern(
    apply(pattern, (node: T) => {
      if (DEBUG && debugFx != undefined) console.log(debugFx(node));
      return node;
    })
  );
}

function evaluate<T>(
  nodeType: Rule<TokenKind, T>,
  expr: string,
  debug?: boolean
): T {
  DEBUG = debug == undefined ? false : debug;
  const parseResult = expectSingleResult(
    expectEOF(nodeType.parse(lexer.parse(expr)))
  );

  return parseResult;
}
