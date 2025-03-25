import { SymbolTable, testTable } from "../components/lexicon";
import {
  multiTest,
  testParagraph,
  testRun,
  testText,
} from "../components/tester";
import { LexValue } from "../components/xValue";
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
  false,
  testParagraph
);

testText(
  "Saving Variables",
  "Save 3 as testVariable.",
  parserRules.PARAGRAPH,
  ["3"],
  false,
  (result: (lookup: SymbolTable<any>) => void) => {
    result(testTable);
    console.log(
      (
        testTable.lookup("testVariable")(
          null as unknown as LexValue<any>
        )() as number
      ).toString()
    );
  }
);
