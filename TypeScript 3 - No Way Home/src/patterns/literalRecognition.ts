import { alt, apply, nil, rep_sc, tok, Token } from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, TokenKind } from "../header";

pattern(parserRules.STRING_LITERAL, rep_sc(parserRules.STRING_CHARACTER));
pattern(
  parserRules.STRING_CHARACTER,
  apply(
    alt(tok(TokenKind.Alpha), tok(TokenKind.Numeric), tok(TokenKind.Space)),
    (token: Token<any>) => token.text
  )
);
