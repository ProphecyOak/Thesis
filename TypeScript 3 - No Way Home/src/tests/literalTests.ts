import { rep_sc, rule, str, Token } from "typescript-parsec";
import {
  customRule,
  multiTest,
  testPrint,
  testText,
} from "../components/tester";
import { parserRules, TokenKind } from "../header";

describe("Strings", () => {
  multiTest(
    "String Characters",
    new Map<string, (string | number)[]>([
      ["a", ["a"]],
      ["Z", ["Z"]],
      ["1", ["1"]],
      [" ", [" "]],
    ]),
    parserRules.STRING_CHARACTER,
    false,
    testPrint
  );
  multiTest(
    "Quote parity",
    new Map<string, (string | number)[]>([
      ["'Hello World'", ["Hello World"]],
      ["'Hello\"World'", ['Hello"World']],
      ['"Hello\'World"', ["Hello'World"]],
      ['"1343 afsdf"', ["1343 afsdf"]],
      ["\"1343 afsdf'", ["ERROR"]],
      ['"1343\\" afsdf"', ['1343" afsdf']],
      ['"1343\\" \\\'afsdf"', ["1343\" 'afsdf"]],
    ]),
    parserRules.STRING_LITERAL,
    false,
    testPrint
  );
});

describe("Numbers", () => {
  testText(
    "Dot character",
    ".",
    customRule(str(".")),
    ["."],
    false,
    (token: Token<TokenKind>) => testPrint(token.text)
  );
  multiTest(
    "Number literals",
    new Map<string, (string | number)[]>([
      ["23", [23]],
      ["45.2", [45.2]],
      ["4.5.2", ["ERROR"]],
      [".2", [0.2]],
      ["1.", [1]],
    ]),
    parserRules.NUMERIC_LITERAL,
    false,
    testPrint
  );
});
