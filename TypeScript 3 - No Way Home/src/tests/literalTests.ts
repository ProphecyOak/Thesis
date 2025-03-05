import { rep_sc } from "typescript-parsec";
import { multiTest, testPrint, testText } from "../components/tester";
import { parserRules } from "../header";

describe("Strings", () => {
  multiTest(
    "String Characters",
    new Map<string, string[]>([
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
    new Map<string, string[]>([
      ["'Hello World'", ["Hello World"]],
      ["'Hello\"World'", ['Hello"World']],
      ['"Hello\'World"', ["Hello'World"]],
      ['"1343 afsdf"', ["1343 afsdf"]],
      ["\"1343 afsdf'", ["ERROR"]],
    ]),
    parserRules.STRING_LITERAL,
    false,
    testPrint
  );
});
