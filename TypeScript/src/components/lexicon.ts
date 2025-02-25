import { semantic_state } from "../structures/semantic_state";
import { BasicTypes, compose } from "../structures/semantic_type";
import { tree_node } from "../structures/tree_node";

export { verbs, loadLexicon };

const verbs = new Map<string, tree_node>([
  [
    "say",
    new tree_node(
      "Verb",
      compose(BasicTypes.ANY, compose(BasicTypes.VOID, BasicTypes.VOID)),
      (argument: tree_node) => () => console.log(argument.value)
    ),
  ],
]);

function loadLexicon(state: semantic_state): void {
  verbs.forEach((value: tree_node, key: string) => {
    state.add("Verb", key, value);
  });
}
