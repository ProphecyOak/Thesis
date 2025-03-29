import {
  multiTest,
  testParagraph,
  testPrint,
  testRun,
  testText,
} from "../components/tester";
import { LexValue } from "../components/xValue";
import { parserRules } from "../header";

multiTest(
  "Verb grabbing",
  // The verbs here actually need to be in the lookup table
  // Or it will throw an error.
  new Map<string, string[]>([
    ["Say Stuff.", ["Say", "Stuff"]],
    ["Say 34.", ["Say", "34"]],
    ["Say 'things'.", ["Say", "'things'"]],
    ["Bark.", ["Bark", ""]],
    ["Report.", ["Report", ""]],
    [
      "Save 'Hello World!' as Greeting.",
      ["Save", "'Hello World!' as Greeting"],
    ],
  ]),
  parserRules.SENTENCE,
  true,
  (word: LexValue<any>) => {
    testPrint(word.getSymbol());
    testPrint(word.getRest());
  }
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

testText(
  "Paragraph",
  "Say 2.\nSay 3.\nSay 4.",
  parserRules.PARAGRAPH,
  ["2", "3", "4"],
  false,
  testParagraph
);
