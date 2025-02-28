import { Word } from "../components/lexicon";
import { partsOfSpeech } from "./parts_of_speech";
import { TreeNode } from "./tree_node";

export { SemanticState };

const ERROR_TYPE = "STATE ERROR:";

class SemanticState {
  private lookupTable: Map<string, Map<string, Word<any>>> = new Map<
    string,
    Map<string, Word<any>>
  >();
  private parentScope: SemanticState | null;
  private returnValue: TreeNode | undefined;

  // CREATE A STATE
  constructor(parentScope?: SemanticState) {
    this.parentScope = parentScope == undefined ? null : parentScope;
    Object.values(partsOfSpeech).forEach((partOfSpeech) =>
      this.lookupTable.set(partOfSpeech, new Map<string, Word<any>>())
    );
  }

  // FIND A WORD SOMEWHERE IN THE LINEAGE OF STATES
  lookupWord(partOfSpeech: string, word: string): Word<any> {
    const result = this.lookupTable.get(partOfSpeech)?.get(word);
    if (result == undefined) {
      if (this.parentScope == null)
        throw new Error(
          `${ERROR_TYPE} ${word} is not found in the lexical category ${partOfSpeech}`
        );
      return this.parentScope.lookupWord(partOfSpeech, word);
    }
    return result;
  }

  // ADD A WORD TO THE CURRENT STATE
  addWord(word: Word<any>) {
    const lexicalCategory = this.lookupTable.get(word.partOfSpeech);
    if (lexicalCategory == undefined)
      throw new Error(
        `${ERROR_TYPE} Word: ${word.word} has an invalid lexical category: ${word.partOfSpeech}`
      );
    lexicalCategory.set(word.word, word);
  }

  // SUPPLY A RETURNED VALUE TO THE STATE ONE LEVEL HIGHER
  returnNode(val: TreeNode) {
    if (this.parentScope == null)
      throw new Error(`${ERROR_TYPE} Cannot return from global scope.`);
    this.parentScope.returnValue = val;
  }
}
