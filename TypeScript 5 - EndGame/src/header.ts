import { rule } from "typescript-parsec";
import { LexValue, LitValue } from "./components/xValue";
import { SymbolTable } from "./components/lexicon";

export { parserRules, Argument, TokenKind, LexicalCategory };

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
  PARAGRAPH: rule<TokenKind, (lookup: SymbolTable<any>) => void>(),
  SENTENCE: rule<TokenKind, LexValue<any>>(),
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

enum Argument {
  Theme,
  Destination,
}
