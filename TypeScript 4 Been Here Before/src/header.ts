import { Parser, rule, Token } from "typescript-parsec";

export { parserRules, Argument, TokenKind, LexicalCategory };

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
  SENTENCE: rule<TokenKind, any>(),
  VERB: rule<TokenKind, any>(),
  LITERAL: rule<TokenKind, any>(),
  STRING_LITERAL: rule<TokenKind, string>(),
  STRING_CHARACTER: rule<TokenKind, string>(),
  NUMERIC_LITERAL: rule<TokenKind, number>(),
};

enum Argument {
  Theme,
  Destination,
}
