import { multiTest, testPrint } from "../components/tester";
import { Value } from "../components/xValue";
import { parserRules } from "../header";

multiTest(
  "Verb grabbing",
  new Map<string, string[]>([
    ["Say Stuff.", ["Say"]],
    ["Bark.", ["Bark"]],
  ]),
  parserRules.SENTENCE,
  true,
  (word: Value<any>) => testPrint(word.getSymbol())
);
