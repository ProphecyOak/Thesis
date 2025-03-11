import { multiTest, testPrint } from "../components/tester";
import { parserRules } from "../header";

multiTest(
  "Word Recognizer",
  new Map<string, string[]>([
    ["Bark", ["Bark"]],
    ["Say ", ["Say"]],
    ["Say stuff", ["ERROR"]],
    ["S2ay ", ["ERROR"]],
  ]),
  parserRules.WORD,
  false,
  testPrint
);
