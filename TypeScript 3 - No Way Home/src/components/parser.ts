import {
  apply,
  buildLexer,
  combine,
  expectEOF,
  expectSingleResult,
  nil,
  Parser,
  Rule,
} from "typescript-parsec";
import { MeaningInterface, TokenKind, TreeNodeInterface } from "../header";

export { evaluate, pattern, recursivelyGrabArguments };

const lexer = buildLexer([
  [true, /^[0-9]*/g, TokenKind.Numeric],
  [true, /^[a-zA-Z]*/g, TokenKind.Alpha],
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

function recursivelyGrabArguments(
  meaning: MeaningInterface<any>
): Parser<TokenKind, MeaningInterface<any>> {
  console.log(
    `This meaning has ${meaning.argumentsFull() ? "no" : "at least one"} argument missing.`
  );
  if (meaning.argumentsFull()) return apply(nil(), () => meaning);
  let nextArg = meaning.nextArgument();
  return combine(nextArg.frame, (val: MeaningInterface<any>) => {
    meaning.giveArgument(nextArg.arg, val);
    return recursivelyGrabArguments(meaning);
  });
}

function evaluate<T>(nodeType: Rule<any, T>, expr: string, debug?: boolean): T {
  DEBUG = debug == undefined ? false : debug;
  const parseResult = expectSingleResult(
    expectEOF(nodeType.parse(lexer.parse(expr)))
  );
  return parseResult;
}
