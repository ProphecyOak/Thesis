import { rep_sc } from "typescript-parsec";
import { testPrint, testText } from "../components/tester";
import { parserRules } from "../header";

describe("String Characters", () => {
  testText(
    "Lowercase alpha",
    "a",
    parserRules.STRING_CHARACTER,
    ["a"],
    false,
    testPrint
  );
  testText(
    "Uppercase alpha",
    "Z",
    parserRules.STRING_CHARACTER,
    ["Z"],
    false,
    testPrint
  );
  testText(
    "Number",
    "1",
    parserRules.STRING_CHARACTER,
    ["1"],
    false,
    testPrint
  );
  testText("Space", " ", parserRules.STRING_CHARACTER, [" "], false, testPrint);
});
