import {
  apply,
  combine,
  kleft,
  nil,
  opt_sc,
  str,
  tok,
} from "typescript-parsec";
import { pattern, recursivelyGrabArguments } from "../components/parser";
import {
  LexicalCategory,
  MeaningInterface,
  parserRules,
  StateInterface,
  TreeLabel,
  TreeNodeInterface,
} from "../header";
import { TreeNode } from "../components/treeNode";

pattern(parserRules.SENTENCE, kleft(parserRules.VERB_PHRASE, str(".")));

pattern(
  parserRules.VERB_PHRASE,
  combine(parserRules.VERB, recursivelyGrabArguments)
);

pattern(
  parserRules.VERB,
  apply(parserRules.WORD, (value: string) => {
    let newNode = new TreeNode(TreeLabel.Verb, value);
    newNode
      .getMeaning()
      .assignMeaning(
        (meaning: MeaningInterface<any>) => (state: StateInterface) =>
          state.lookupSymbol(value, LexicalCategory.Verb).evaluate(state)
      );
    return newNode.getMeaning().refresh();
  })
);
