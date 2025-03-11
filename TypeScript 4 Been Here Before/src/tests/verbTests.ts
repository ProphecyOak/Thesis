import { LexicalItem } from "../components/lexicalItem";
import { Meaning } from "../components/meaning";
import { State } from "../components/state";
import {
  customRule,
  multiTest,
  testPrint,
  testText,
} from "../components/tester";
import {
  LexicalCategory,
  parserRules,
  StateInterface,
  TreeNodeInterface,
} from "../header";

function testState(node: TreeNodeInterface): StateInterface {
  let state = new State();
  let barkWord = new LexicalItem("bark", LexicalCategory.Verb);
  return state;
}

testText(
  "Simple verb.",
  "Bark",
  parserRules.VERB,
  ["Bark!"],
  false,
  (node: TreeNodeInterface) => {
    let state = testState(node);
    node.getMeaning().evaluate(state)();
  }
);
