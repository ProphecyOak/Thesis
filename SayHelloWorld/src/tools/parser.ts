/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  alt_sc,
  apply,
  buildLexer,
  expectEOF,
  expectSingleResult,
  kright,
  opt_sc,
  Parser,
  rep_sc,
  Rule,
  rule,
  seq,
  str,
  tok,
  Token,
} from "typescript-parsec";
import { Lexicon, LexRoot, XBar } from "../structure/xBar";

export enum TokenKind {
  Numeric,
  Alpha,
  Space,
  NewLine,
  Quote,
  BackSlash,
  Other,
}

type PreLexXBar = (lex: Lexicon) => XBar;

const parserRules = {
  WORD: rule<TokenKind, PreLexXBar>(),
  SENTENCE: rule<TokenKind, PreLexXBar>(),
  NUMBER: rule<TokenKind, PreLexXBar>(),
  STRING: rule<TokenKind, PreLexXBar>(),
  PUNCTUATION: rule<TokenKind, PreLexXBar>(),
};

export class NaturalParser {
  static TokenKind = TokenKind;
  static lexer = buildLexer([
    [true, /^[0-9]+/g, TokenKind.Numeric],
    [true, /^[a-zA-Z]+/g, TokenKind.Alpha],
    [true, /^ /g, TokenKind.Space],
    [true, /^\n/g, TokenKind.NewLine],
    [true, /^['"]/g, TokenKind.Quote],
    [true, /^\\/g, TokenKind.BackSlash],
    [true, /^./g, TokenKind.Other],
  ]);
  static parserRules = parserRules;

  //Returns the appropriate XBar given text.
  static evaluate(
    sentence: string,
    lexicon: Lexicon,
    rule: Rule<TokenKind, PreLexXBar>
  ): XBar {
    const parseResult = expectSingleResult(
      expectEOF(rule.parse(NaturalParser.lexer.parse(sentence)))
    )(lexicon);
    return parseResult;
  }

  static setPattern<T>(
    parserRule: Rule<TokenKind, T>,
    pattern: Parser<TokenKind, T>
  ): void {
    parserRule.setPattern(pattern);
  }
}

NaturalParser.setPattern(
  parserRules.NUMBER,
  apply(
    str("2"),
    () => (_lex: Lexicon) =>
      new XBar((_lex: Lexicon) => -1, [LexRoot.Lexicon], LexRoot.Number)
  )
);
NaturalParser.setPattern(
  parserRules.PUNCTUATION,
  apply(
    str("."),
    () => (_lex: Lexicon) =>
      new XBar((_lex: Lexicon) => -1, [LexRoot.Lexicon], LexRoot.Void)
  )
);

NaturalParser.setPattern(
  parserRules.WORD,
  apply(
    tok(TokenKind.Alpha),
    (symbol: Token<TokenKind.Alpha>) => (lex: Lexicon) =>
      lex.lookup(symbol.text)
  )
);
NaturalParser.setPattern(
  parserRules.SENTENCE,
  apply(
    seq(
      parserRules.WORD,
      rep_sc(
        kright(
          opt_sc(str(" ")),
          alt_sc(parserRules.WORD, parserRules.NUMBER, parserRules.PUNCTUATION)
        )
      )
    ),
    combineReduce
  )
);

function combineReduce([inputPreLex, restOfSentence]: [
  PreLexXBar,
  PreLexXBar[]
]): PreLexXBar {
  if (restOfSentence.length == 0) return inputPreLex;
  return (lex: Lexicon) => {
    const currentTree = inputPreLex(lex);
    const newArg = restOfSentence.shift()!(lex);
    switch (newArg.symbol) {
      case "each":
        break;
      case "the":
        break;
    }
    return XBar.createParent(currentTree, newArg);
  };
}
