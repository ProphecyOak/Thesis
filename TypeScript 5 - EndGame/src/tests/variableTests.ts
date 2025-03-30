import { multiTest, testParagraph } from "../components/tester";
import { parserRules } from "../header";

multiTest(
  "Basic Variables",
  new Map<string, string[]>([
    ["Say testVARIABLE.", ["2"]],
    ["Save 3 as testVariable.", []],
    ["Say testVariable.", ["3"]],
    ["Save 4 as Stuff.", []],
    ["Say Stuff.", ["4"]],
    ["Save 2 as Stuff.\nSay Stuff.", ["2"]],
  ]),
  parserRules.PARAGRAPH,
  true,
  testParagraph
);
