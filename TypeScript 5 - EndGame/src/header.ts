import { buildLexer, rule } from "typescript-parsec";
import { LexValue, LitValue, Value } from "./components/xValue";
import { XBar } from "./components/wordArgument";

export {
  parserRules,
  TokenKind,
  LexicalCategory,
  SymbolTable,
  VariableMeaning,
  lexer,
  XBarInterface,
  Argument,
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
}

interface XBarInterface {
  root: Value<any>;
  lookup?: SymbolTable<VariableMeaning>;
  childPhrase: XBar | null;
  adjunct: XBar | null;
  label: string;
  assignLookup(lookup: SymbolTable<VariableMeaning>): void;
  acceptArgument(argType: Argument, symbol: string): void;
  run(): void;
  toString(): string;
}

const parserRules = {
  PARAGRAPH: rule<TokenKind, (lookup: SymbolTable<any>) => void>(),
  SENTENCE: rule<TokenKind, XBarInterface>(),
  REST: rule<TokenKind, string>(),
  WORD: rule<TokenKind, LexValue<any>>(),
  LITERAL: rule<TokenKind, LitValue<string | number>>(),
  STRING_LITERAL: rule<TokenKind, string>(),
  STRING_CHARACTER: rule<TokenKind, string>(),
  NUMERIC_LITERAL: rule<TokenKind, number>(),
};

enum LexicalCategory {
  Verb,
  Variable,
}

type VariableMeaning =
  | (() => void | string | number)
  | ((rest: string) => XBar);

interface SymbolTable<T> {
  words: Map<string, T>;
  lookup(symbol: string): T;
  add(destination: string, value: VariableMeaning): void;
}
