import {
  apply,
  expectEOF,
  expectSingleResult,
  Parser,
  Rule,
} from "typescript-parsec";
import { lexer, SymbolTable, TokenKind } from "../header";

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

  return parseResult;
}
