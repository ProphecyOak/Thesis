import { alt_sc } from "typescript-parsec";
import {
  customRule,
  multiTest,
  testPrint,
  testRun,
  testText,
  testValue,
} from "../components/tester";
import { LexValue, Value } from "../components/xValue";
import { parserRules } from "../header";

multiTest(
  "Verb grabbing",
  // The verbs here actually need to be in the lookup table
  // Or it will throw an error.
  new Map<string, string[]>([
    ["Say Stuff.", ["Say", "Stuff"]],
    ["Say 34.", ["Say", "34"]],
    ["Say 'things'.", ["Say", "things"]],
    ["Bark.", ["Bark", ""]],
    ["Report.", ["Report", ""]],
  ]),
  parserRules.SENTENCE,
  false,
  (word: LexValue<any>) => {
    testPrint(word.getSymbol());
    testPrint(word.getRest());
  }
);

testText(
  "Grab numeric theme",
  "2",
  customRule(alt_sc(parserRules.LITERAL, parserRules.WORD)),
  [2],
  false,
  testValue
);

multiTest(
  "Basic Verbs",
  new Map<string, string[]>([
    ["Bark.", ["Woof"]],
    ["Say 2.", ["2"]],
  ]),
  parserRules.SENTENCE,
  false,
  testRun
);
