import { SemanticState } from "../structures/semantic_state";

export { type Word };

interface Word<T> {
  partOfSpeech: string;
  word: string;
  getValue: (state: SemanticState) => T;
}
