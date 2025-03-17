import {
  apply,
  buildLexer,
  expectEOF,
  expectSingleResult,
  Parser,
  Rule,
} from "typescript-parsec";
import { parserRules, TokenKind } from "../header";

export { evaluate, pattern };

const lexer = buildLexer([
  [true, /^[0-9]+/g, TokenKind.Numeric],
  [true, /^[a-zA-Z]+/g, TokenKind.Alpha],
  [true, /^ /g, TokenKind.Space],
  [true, /^\n/g, TokenKind.NewLine],
  [true, /^['"]/g, TokenKind.Quote],
  [true, /^\\/g, TokenKind.BackSlash],
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

function evaluate<T>(nodeType: Rule<any, T>, expr: string, debug?: boolean): T {
  DEBUG = debug == undefined ? false : debug;
  if (nodeType == parserRules.SENTENCE) expr = expr.slice(0, expr.length - 1);
  const parseResult = expectSingleResult(
    expectEOF(nodeType.parse(lexer.parse(expr)))
  );
  return parseResult;
}
