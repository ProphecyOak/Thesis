import {
  alt,
  apply,
  combine,
  kleft,
  nil,
  rep_sc,
  seq,
  str,
  tok,
  Token,
} from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, TokenKind } from "../header";

pattern(
  parserRules.STRING_LITERAL,
  apply(
    combine(tok(TokenKind.Quote), (quote: Token<TokenKind.Quote>) =>
      kleft(
        rep_sc(
          alt(
            parserRules.STRING_CHARACTER,
            apply(
              str(quote.text == "'" ? '"' : "'"),
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
    alt(tok(TokenKind.Alpha), tok(TokenKind.Numeric), tok(TokenKind.Space)),
    (token: Token<any>) => token.text
  )
);
