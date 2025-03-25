import {
  apply,
  buildLexer,
  expectEOF,
  expectSingleResult,
  Parser,
  Rule,
} from "typescript-parsec";
import { parserRules, TokenKind } from "../header";
import assert from "assert";
import { LexValue } from "./xValue";
import { SymbolTable } from "./lexicon";

export { evaluate, pattern, lexer };

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

function evaluate(
  nodeType: Rule<any, any>,
  expr: string,
  lookupTable: SymbolTable<any>,
  debug?: boolean
): any {
  DEBUG = debug == undefined ? false : debug;
  // if (DEBUG) console.debug(lexer.parse(expr));
  const parseResult = expectSingleResult(
    expectEOF(nodeType.parse(lexer.parse(expr)))
  );
  if (nodeType == parserRules.SENTENCE) {
    // if (DEBUG) console.log(parseResult);
    parseResult.attachTable(lookupTable);
  }

  return parseResult;
}
