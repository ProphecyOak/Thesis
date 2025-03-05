import {
  alt,
  apply,
  combine,
  kleft,
  kright,
  rep_sc,
  str,
  tok,
  Token,
} from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, TokenKind } from "../header";

pattern(
  parserRules.LITERAL,
  alt(parserRules.STRING_LITERAL, parserRules.NUMERIC_LITERAL)
);

pattern(
  parserRules.STRING_LITERAL,
  apply(
    combine(tok(TokenKind.Quote), (quote: Token<TokenKind.Quote>) =>
      kleft(
        rep_sc(
          alt(
            parserRules.STRING_CHARACTER,
            apply(
              alt(
                str(quote.text == "'" ? '"' : "'"),
                kright(
                  tok(TokenKind.BackSlash),
                  alt(tok(TokenKind.Quote), tok(TokenKind.BackSlash))
                )
              ),
              (token: Token<TokenKind>) => token.text
            )
          )
        ),
        str(quote.text)
      )
    ),
    (values: string[]) => values.join("")
  )
);
pattern(
  parserRules.STRING_CHARACTER,
  apply(
    alt(
      tok(TokenKind.Alpha),
      tok(TokenKind.Numeric),
      tok(TokenKind.Space),
      tok(TokenKind.Other)
    ),
    (token: Token<any>) => token.text
  )
);
