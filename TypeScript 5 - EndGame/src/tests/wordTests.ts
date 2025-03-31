import { multiTest, testPrint } from "../components/tester";
import { LexValue } from "../components/xValue";
import { parserRules } from "../header";

multiTest(
  "Word Recognizer",
  [
    ["Bark", ["Bark"]],
    ["Say ", ["Say"]],
    ["Say stuff", ["ERROR"]],
    ["S2ay ", ["ERROR"]],
  ],
  parserRules.WORD,
  false,
  (value: LexValue<any>) => testPrint(value.getSymbol())
);
