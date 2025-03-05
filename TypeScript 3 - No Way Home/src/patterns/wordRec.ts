import { apply, kleft, opt_sc, rep_sc, tok, Token } from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, TokenKind } from "../header";

pattern(
  parserRules.WORD,
  apply(
    kleft(rep_sc(tok(TokenKind.Alpha)), opt_sc(tok(TokenKind.Space))),
    (tokens: Token<TokenKind.Alpha>[]) =>
      tokens.map((token: Token<TokenKind.Alpha>) => token.text).join("")
  )
);
