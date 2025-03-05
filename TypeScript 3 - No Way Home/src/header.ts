import { Parser, rule, Token } from "typescript-parsec";

export {
  parserRules,
  TreeNodeInterface,
  MeaningInterface,
  TreeLabel,
  StateInterface,
  Argument,
  TokenKind,
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
  Period,
  Other,
}

const parserRules = {
  SENTENCE: rule<TokenKind, MeaningInterface<any>>(),
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
  // Returns the fully evaluated version of the segment.
  getMeaning(): O;
  // Gives the segment another argument, and returns whether or not the meaning is available.
  giveArgument(arg: Argument, value: MeaningInterface<any>): boolean;
  // Returns the alt() parser for the different arguments to look for next.
  nextArgument(): Parser<Token<TokenKind>, MeaningInterface<any>>;
}

interface StateInterface {
  // Returns whether or not this state is the root state.
  isRoot(): boolean;
  // Returns the meaning found under the lexical category with the given symbol
  lookupSymbol(symbol: string, cat: LexicalCategory): MeaningInterface<any>;
  // Returns a new state which is a child of this one.
  childState(): StateInterface;
  // Returns the parent state if there is one.
  parentState(): StateInterface;
}
