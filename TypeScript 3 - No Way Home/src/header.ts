import { Parser, Token } from "typescript-parsec";

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
  Other,
}

enum TreeLabel {
  Verb,
  Literal,
}

interface TreeNodeInterface {
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

interface Meaning<O> {
  // Returns the fully evaluated version of the segment.
  getMeaning(): O;
  // Gives the segment another argument, and returns whether or not the meaning is available.
  giveArgument(arg: Argument, value: Meaning<any>): boolean;
  // Returns the alt() parser for the different arguments to look for next.
  nextArgument(): Parser<Token<TokenKind>, Meaning<any>>;
}
