import { parts_of_speech } from "./parts_of_speech";
import { tree_node } from "./tree_node";

export { semantic_state };

type lookupRecord = Map<string, Map<string, tree_node>>;

class semantic_state {
  parent_state: semantic_state | null;
  lookup_table: lookupRecord;
  parts_of_speech: string[];

  constructor(parent_state: semantic_state | null) {
    this.parent_state = parent_state;
    this.parts_of_speech = parts_of_speech;
    this.lookup_table = this.createEmptyLookup();
  }

  add(pos: string, name: string, new_word: tree_node) {
    this.lookup_table.get(pos)?.set(name, new_word);
  }
  lookup(pos: string, name: string): tree_node {
    const word = this.lookup_table.get(pos)?.get(name);
    if (word == undefined) {
      if (this.parent_state != null) return this.parent_state.lookup(pos, name);
      else throw new Error(`${name} missing from lexicon.`);
    }
    return word;
  }
  child_state(): semantic_state {
    return new semantic_state(this);
  }

  createEmptyLookup(): lookupRecord {
    const table: lookupRecord = new Map<string, Map<string, tree_node>>();
    for (const pos in this.parts_of_speech)
      table.set(pos, new Map<string, tree_node>());
    return table;
  }
}
