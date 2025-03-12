import { Parser, rule, Token } from "typescript-parsec";
import { LexValue, LitValue } from "./components/xValue";

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
  SENTENCE: rule<TokenKind, any>(),
  VERB: rule<TokenKind, any>(),
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
}
