import { apply, kmid, opt_sc, rep_sc, tok, Token } from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, TokenKind } from "../header";
import { LexValue } from "../components/xValue";

pattern(
  parserRules.WORD,
  apply(
    kmid(
      opt_sc(tok(TokenKind.Space)),
      rep_sc(tok(TokenKind.Alpha)),
      opt_sc(tok(TokenKind.Space))
    ),
    (tokens: Token<TokenKind.Alpha>[]) => {
      const symbol = tokens
        .map((token: Token<TokenKind.Alpha>) => token.text)
        .join("");
      return new LexValue(symbol);
    }
  )
);
