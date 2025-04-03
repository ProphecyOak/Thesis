import { multiTest, testParagraph, testText } from "../components/tester";
import { parserRules } from "../header";

multiTest(
  "Basic Variables",
  [
    ["Say testVARIABLE.", ["2"]],
    ["Say true.", ["true"]],
    ["Save 3 as testVARIABLE.", []],
    ["Say testVARIABLE.", ["3"]],
    ["Save 4 as Stuff.", []],
    ["Say Stuff.", ["4"]],
    ["Save 2 as Stuff.\nSay Stuff.", ["2"]],
  ],
  parserRules.PARAGRAPH,
  true,
  testParagraph
);

testText(
  "String Iteration",
  "For each Character in 'Hello World' Say Character.",
  parserRules.PARAGRAPH,
  ["H", "e", "l", "l", "o", " ", "W", "o", "r", "l", "d"],
  false,
  testParagraph
);

testText(
  "Multiplier",
  "Say 2 5 times.",
  parserRules.PARAGRAPH,
  ["2", "2", "2", "2", "2"],
  false,
  testParagraph
);
