import { Parser, rule, Token } from "typescript-parsec";

export {
  parserRules,
  Argument,
  TokenKind,
  VerbInterface,
  ArgumentValue,
  BlockInterface,
  SemVar,
  StoredVerb,
};

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
  BLOCK: rule<TokenKind, any>(),
  SENTENCE: rule<TokenKind, () => void>(),
  VERB: rule<TokenKind, VerbInterface>(),
  WORD: rule<TokenKind, string>(),
  LITERAL: rule<TokenKind, any>(),
  STRING_LITERAL: rule<TokenKind, string>(),
  STRING_CHARACTER: rule<TokenKind, string>(),
  NUMERIC_LITERAL: rule<TokenKind, number>(),
};

enum Argument {
  Theme = "Theme",
}
type ArgumentValue = null | string | number;

interface VerbInterface {
  //Returns a closure that takes into account state and arguments.
  getResult(): () => void;

  //Assigns this block to the Verb
  setBlock(block: BlockInterface): void;

  //Returns parser to grab all essential arguments, plugging them all in.
  acceptArguments(): Parser<TokenKind, any>;
}

type StoredVerb = (
  verb: VerbInterface
) => (argumentVals: Partial<Record<Argument, ArgumentValue>>) => () => void;

interface SemVar {}

interface BlockInterface {
  // TREE STUFF
  // Returns whether or not this state is the root state.
  isRoot(): boolean;
  // Returns a new state which is a child of this one.
  getChild(): BlockInterface;
  // Returns the parent state if there is one.
  getParent(): BlockInterface;

  // LOOKUP TABLE STUFF
  // Adds new symbol.
  addSymbol(symbol: string, value: SemVar): void;
  // Returns the meaning found with the given symbol
  lookupSymbol(symbol: string): SemVar | StoredVerb;

  // SENTENCES
  addSentence(verb: VerbInterface): void;
}
