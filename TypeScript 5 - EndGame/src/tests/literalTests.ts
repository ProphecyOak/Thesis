import { str, Token } from "typescript-parsec";
import {
  customRule,
  multiTest,
  testPrint,
  testText,
  testValue,
} from "../components/tester";
import { parserRules, TokenKind } from "../header";

describe("Strings", () => {
  multiTest(
    "String Characters",
    [
      ["a", ["a"]],
      ["Z", ["Z"]],
      ["1", ["1"]],
      [" ", [" "]],
    ],
    parserRules.STRING_CHARACTER,
    false,
    testPrint
  );
  multiTest(
    "Quote parity",
    [
      ["'Hello World'", ["Hello World"]],
      ["'Hello\"World'", ['Hello"World']],
      ['"Hello\'World"', ["Hello'World"]],
      ['"1343 afsdf"', ["1343 afsdf"]],
      ["\"1343 afsdf'", ["ERROR"]],
      ['"1343\\" afsdf"', ['1343" afsdf']],
      ['"1343\\" \\\'afsdf"', ["1343\" 'afsdf"]],
    ],
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
    [
      ["23", [23]],
      ["2", [2]],
      ["45.2", [45.2]],
      ["4.5.2", ["ERROR"]],
      [".2", [0.2]],
      ["1.", ["ERROR"]],
      [".", ["ERROR"]],
      ["", ["ERROR"]],
    ],
    parserRules.NUMERIC_LITERAL,
    false,
    testPrint
  );
});

multiTest(
  "All kinds of Literals",
  [
    ["23", [23]],
    ["'45.2'", ["45.2"]],
    ["4.5.2", ["ERROR"]],
    ["'things and stuff'", ["things and stuff"]],
    ["1.", ["ERROR"]],
    ["'\\\\'", ["\\"]],
  ],
  parserRules.LITERAL,
  false,
  testValue
);
