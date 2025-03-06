import { Meaning } from "../components/meaning";
import { State } from "../components/state";
import {
  customRule,
  multiTest,
  testPrint,
  testText,
} from "../components/tester";
import {
  Argument,
  LexicalCategory,
  MeaningInterface,
  parserRules,
  StateInterface,
  TreeNodeInterface,
} from "../header";

function getFakeState(node: TreeNodeInterface): StateInterface {
  let testState = new State();
  testState.addSymbol(
    "Bark",
    LexicalCategory.Verb,
    new Meaning().assignMeaning(
      (meaning: MeaningInterface<any>) => (state: StateInterface) => () =>
        console.log("Bark!")
    )
  );
  testState.addSymbol(
    "Say",
    LexicalCategory.Verb,
    new Meaning()
      .assignMeaning(
        (meaning: MeaningInterface<any>) => (state: StateInterface) => () =>
          console.log(meaning.accessArgument(Argument.Theme))
      )
      .requireArgument(Argument.Theme)
  );
  return testState;
}
describe("Basics", () => {
  testText(
    "Simple verb",
    "Bark",
    parserRules.VERB,
    ["Bark!"],
    false,
    (meaning: MeaningInterface<any>) => {
      let state = getFakeState(meaning.getNode());
      meaning.evaluate(state)();
    }
  );
  testText(
    "Simple sentence",
    "Bark.",
    parserRules.SENTENCE,
    ["Bark!"],
    false,
    (meaning: MeaningInterface<any>) => {
      let state = getFakeState(meaning.getNode());
      meaning.evaluate(state)();
    }
  );
});

multiTest(
  "Basic Arguments",
  new Map<string, string[]>([
    ["Say 23.", ["23"]],
    ["Say 'free'.", ["free"]],
  ]),
  parserRules.SENTENCE,
  false,
  (meaning: MeaningInterface<any>) => {
    let state = getFakeState(meaning.getNode());
    meaning.evaluate(state)();
  }
);
