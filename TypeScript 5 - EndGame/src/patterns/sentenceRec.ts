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
    ([verb, rest]: [LexValue<any>, string]) => {
      const lastIndex = rest.length - 1;
      const restOfSentence =
        rest[lastIndex] == "." ? rest.slice(0, lastIndex) : rest;
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
