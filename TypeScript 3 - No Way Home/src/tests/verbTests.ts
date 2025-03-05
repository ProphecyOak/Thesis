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

testText(
  "Simple verb.",
  "Bark",
  parserRules.VERB,
  ["Bark!"],
  false,
  (node: TreeNodeInterface) => {
    let state = new State();
    let barkMeaning = new Meaning(node);
    barkMeaning.assignMeaning(
      (state: StateInterface) => () => console.log("Bark!")
    );
    state.addSymbol("Bark", LexicalCategory.Verb, barkMeaning);
    node.getMeaning().evaluate(state)();
  }
);
