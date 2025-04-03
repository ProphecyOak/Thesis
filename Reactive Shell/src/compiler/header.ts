import { buildLexer, rule } from "typescript-parsec";
import { LexValue, LitValue, Value } from "./components/xValue";

export { parserRules, TokenKind, LexicalCategory, lexer, Argument };
export type {
  SymbolTableInterface,
  VariableMeaning,
  VariableValue,
  XBarInterface,
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

const lexer = buildLexer([
  [true, /^[0-9]+/g, TokenKind.Numeric],
  [true, /^[a-zA-Z]+/g, TokenKind.Alpha],
  [true, /^ /g, TokenKind.Space],
  [true, /^\n/g, TokenKind.NewLine],
  [true, /^['"]/g, TokenKind.Quote],
  [true, /^\\/g, TokenKind.BackSlash],
  [true, /^./g, TokenKind.Other],
]);

enum Argument {
  Theme,
  Destination,
  Iterator,
  Iterable,
  Body,
  Multiplier,
}

interface XBarInterface {
  root: Value<unknown>;
  lookup?: SymbolTableInterface<VariableMeaning>;
  childPhrase: XBarInterface | null;
  adjunct: XBarInterface | null;
  label: string;
  assignLookup(lookup: SymbolTableInterface<VariableMeaning>): XBarInterface;
  acceptArgument(argType: Argument): XBarInterface;
  optionalArgument(argType: Argument): XBarInterface;
  run(): void;
  getRest(): string;
  toString(): string;
}

const parserRules = {
  PARAGRAPH: rule<TokenKind, (lookup: SymbolTableInterface<unknown>) => void>(),
  SENTENCE: rule<TokenKind, XBarInterface>(),
  REST: rule<TokenKind, string>(),
  WORD: rule<TokenKind, LexValue<unknown>>(),
  LITERAL: rule<TokenKind, LitValue<string | number>>(),
  STRING_LITERAL: rule<TokenKind, string>(),
  STRING_CHARACTER: rule<TokenKind, string>(),
  NUMERIC_LITERAL: rule<TokenKind, number>(),
};

enum LexicalCategory {
  Verb,
  Variable,
}

type VariableValue = void | string | number | XBarInterface | boolean;

type VariableMeaning = (value: Value<unknown>) => () => VariableValue;

interface SymbolTableInterface<T> {
  words: Map<string, T>;
  lookup(symbol: string): T;
  add(destination: string, value: VariableMeaning): void;
  createVerb(symbol: string, argTypes: Argument[], fx: () => unknown): void;
  has(symbol: string): boolean;
}
