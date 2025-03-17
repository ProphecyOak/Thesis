import { multiTest, testPrint, testValue } from "../components/tester";
import { LexValue, Value } from "../components/xValue";
import { parserRules } from "../header";

multiTest(
  "Verb grabbing",
  new Map<string, string[]>([
    ["Say Stuff.", ["Say", "Stuff"]],
    ["Say 34.", ["Say", "34"]],
    ["Say 'things'.", ["Say", "things"]],
    ["Bark.", ["Bark"]],
    ["Report.", ["Report"]],
  ]),
  parserRules.SENTENCE,
  false,
  (word: LexValue<any>) => {
    testPrint(word.getSymbol());
    word.getRest().forEach((value: Value<any>) => testPrint(value.getSymbol()));
  }
);

multiTest(
  "Basic Verbs",
  new Map<string, string[]>([
    ["Bark.", ["Woof"]],
    ["Say 2.", ["2"]],
  ]),
  parserRules.SENTENCE,
  true,
  testValue
);
