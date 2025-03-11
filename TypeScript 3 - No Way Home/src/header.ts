import { Parser, rule, Token } from "typescript-parsec";

export {
  parserRules,
  TreeNodeInterface,
  MeaningInterface,
  TreeLabel,
  StateInterface,
  Argument,
  TokenKind,
  LexicalCategory,
  LexicalItemInterface,
};

enum LexicalCategory {
  Verb,
  Variable,
}

enum TokenKind {
  Numeric,
  Alpha,
  Space,
  NewLine,
  Quote,
  BackSlash,
  Other,
}

const parserRules = {
  SENTENCE: rule<TokenKind, TreeNodeInterface>(),
  VERB: rule<TokenKind, TreeNodeInterface>(),
  WORD: rule<TokenKind, string>(),
  LITERAL: rule<TokenKind, MeaningInterface<any>>(),
  STRING_LITERAL: rule<TokenKind, string>(),
  STRING_CHARACTER: rule<TokenKind, string>(),
  NUMERIC_LITERAL: rule<TokenKind, number>(),
};

enum TreeLabel {
  Verb,
  Literal,
}

interface TreeNodeInterface {
  // Returns whether or not this node is the root of the tree.
  isRoot(): boolean;
  // Returns the label of the tree node.
  getLabel(): TreeLabel;
  // Returns the text encompassed by this node.
  getText(): string;
  // Returns the meaning of this node.
  getMeaning(): MeaningInterface<any>;
  // Adds the given node to the node's children and returns the parent.
  addChild(t: TreeNodeInterface): TreeNodeInterface;
  // Returns the parent of the tree node.
  getParent(): TreeNodeInterface;
  // Applies a function to all the children of the tree node.
  mapChildren<T>(f: (t: TreeNodeInterface) => T): T[];
}

enum Argument {
  Theme,
  Destination,
}

interface MeaningInterface<O> {
  // Returns the corresponding tree node.
  getNode(): TreeNodeInterface;
  // Returns the fully evaluated version of the segment.
  evaluate(state: StateInterface): O;
  // Gives the segment another argument, and returns whether or not the meaning is available.
  giveArgument(arg: Argument, value: MeaningInterface<any>): boolean;
  // Returns the alt() parser for the different arguments to look for next.
  nextArgument(): Parser<Token<TokenKind>, MeaningInterface<any>>;
}

interface StateInterface {
  // Returns whether or not this state is the root state.
  isRoot(): boolean;
  // Returns the meaning found under the lexical category with the given symbol
  lookupSymbol(symbol: string, cat: LexicalCategory): LexicalItemInterface;
  // Returns a new state which is a child of this one.
  childState(): StateInterface;
  // Returns the parent state if there is one.
  parentState(): StateInterface;
  // Adds new symbol to proper map.
  addSymbol(
    symbol: string,
    cat: LexicalCategory,
    value: LexicalItemInterface
  ): void;
}

interface LexicalItemInterface {
  getSymbol(): string;
  getCategory(): LexicalCategory;
  setMeaning(
    f: (wordInstance: TreeNodeInterface) => (state: StateInterface) => any
  ): LexicalItemInterface;
  getMeaning(node: TreeNodeInterface): (state: StateInterface) => any;
  requireArgument(arg: Argument): LexicalItemInterface;
  getLocal(node: TreeNodeInterface): MeaningInterface<any>;
}
