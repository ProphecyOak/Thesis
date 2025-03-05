import {
  apply,
  kright,
  opt,
  opt_sc,
  rep_sc,
  seq,
  str,
  tok,
  Token,
} from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, TokenKind } from "../header";

pattern(
  parserRules.NUMERIC_LITERAL,
  apply(
    seq(
      rep_sc(tok(TokenKind.Numeric)),
      opt_sc(kright(str("."), rep_sc(tok(TokenKind.Numeric))))
    ),
    (
      numberParts: [
        Token<TokenKind.Numeric>[],
        Token<TokenKind.Numeric>[] | undefined,
      ]
    ) =>
      Number(
        numberParts[0].map((token: Token<TokenKind.Numeric>) => token.text) +
          (numberParts[1] != undefined
            ? "." +
              numberParts[1].map(
                (token: Token<TokenKind.Numeric>) => token.text
              )
            : "")
      )
  )
);
