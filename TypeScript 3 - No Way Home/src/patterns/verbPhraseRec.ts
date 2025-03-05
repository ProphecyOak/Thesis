import { apply, kleft, nil, opt_sc, tok } from "typescript-parsec";
import { pattern } from "../components/parser";
import {
  LexicalCategory,
  parserRules,
  StateInterface,
  TreeLabel,
} from "../header";
import { TreeNode } from "../components/treeNode";

pattern(
  parserRules.VERB,
  apply(parserRules.WORD, (value: string) => {
    let newNode = new TreeNode(TreeLabel.Verb, value);
    newNode
      .getMeaning()
      .assignMeaning((state: StateInterface) =>
        state.lookupSymbol(value, LexicalCategory.Verb).evaluate(state)
      );
    return newNode;
  })
);
