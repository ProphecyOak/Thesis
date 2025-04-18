import { testTable } from "../components/lexicon";
import {
  multiTest,
  testParagraph,
  testPrint,
  testRun,
  testText,
} from "../components/tester";
import { parserRules, XBarInterface } from "../header";

multiTest(
  "Verb grabbing",
  // The verbs here actually need to be in the lookup table
  // Or it will throw an error.
  [
    ["Say Stuff.", ["Say", "Stuff"]],
    ["Say 34.", ["Say", "34"]],
    ["Say 'things'.", ["Say", "'things'"]],
    ["Bark.", ["Bark", ""]],
    [
      "Save 'Hello World!' as Greeting.",
      ["Save", "'Hello World!' as Greeting"],
    ],
  ],
  parserRules.SENTENCE,
  false,
  (word: XBarInterface) => {
    word.assignLookup(testTable);
    testPrint(word.root.getSymbol());
    testPrint(word.root.getRest());
  }
);

multiTest(
  "Basic Verbs",
  [
    ["Bark.", ["Woof"]],
    ["Say 2.", ["2"]],
    ["Say 2 stuff.", ["ERROR"]],
  ],
  parserRules.SENTENCE,
  false,
  testRun
);

testText(
  "Paragraph",
  "Say 2.\nSay 3.\nSay 4.",
  parserRules.PARAGRAPH,
  ["2", "3", "4"],
  true,
  testParagraph
);
