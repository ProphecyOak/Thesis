import {
  alt_sc,
  apply,
  kleft,
  rep,
  rep_sc,
  seq,
  str,
  tok,
  Token,
} from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, TokenKind } from "../header";
import { LexValue } from "../components/xValue";

pattern(
  parserRules.SENTENCE,
  apply(
    seq(parserRules.WORD, parserRules.REST),
    (rest: [LexValue<any>, string]) => {
      const verb = rest[0];
      const restOfSentence = rest[1].slice(0, rest[1].length - 1);
      verb.setRest(restOfSentence);
      return verb;
    }
  )
);

pattern(
  parserRules.REST,
  apply(
    rep_sc(
      alt_sc(
        tok(TokenKind.Alpha),
        tok(TokenKind.Numeric),
        tok(TokenKind.Space),
        tok(TokenKind.BackSlash),
        tok(TokenKind.Quote),
        tok(TokenKind.Other)
      )
    ),
    (tokens: Token<TokenKind>[]) => {
      return tokens.reduce((acc: string, e: Token<TokenKind>) => {
        return acc + e.text;
      }, "");
    }
  )
);
