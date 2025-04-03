import {
  apply,
  combine,
  fail,
  kright,
  nil,
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
  combine(
    seq(
      rep_sc(tok(TokenKind.Numeric)),
      opt_sc(kright(str("."), rep_sc(tok(TokenKind.Numeric))))
    ),
    (
      numberParts: [
        Token<TokenKind.Numeric>[],
        Token<TokenKind.Numeric>[] | undefined,
      ]
    ) => {
      let firstPart = numberParts[0].map(
        (token: Token<TokenKind.Numeric>) => token.text
      );
      let secondPart =
        numberParts[1] != undefined
          ? "." +
            numberParts[1].map((token: Token<TokenKind.Numeric>) => token.text)
          : "";
      if (secondPart == "." || firstPart + secondPart == "")
        return fail("Not actually a number");
      let newNum = Number(firstPart + secondPart);
      return apply(nil(), () => newNum);
    }
  )
);
