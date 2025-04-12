/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  alt_sc,
  apply,
  buildLexer,
  combine,
  expectEOF,
  expectSingleResult,
  kleft,
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
import { CompoundLexType, Lexicon, LexRoot, XBar } from "../structure/xBar";

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
  PARAGRAPH: rule<TokenKind, PreLexXBar>(),
  SENTENCE: rule<TokenKind, PreLexXBar>(),
  WORD: rule<TokenKind, PreLexXBar>(),
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
  parserRules.STRING,
  apply(
    combine(tok(TokenKind.Quote), (quote: Token<TokenKind.Quote>) =>
      kleft(
        rep_sc(
          apply(
            alt_sc(
              tok(TokenKind.Alpha),
              tok(TokenKind.Numeric),
              tok(TokenKind.Space),
              str(quote.text == "'" ? '"' : "'"),
              kright(str("\\"), alt_sc(str("\\"), str(quote.text)))
            ),
            (token: Token<TokenKind>) => token.text
          )
        ),
        str(quote.text)
      )
    ),
    (value: string[]) => (_lex: Lexicon) =>
      new XBar(
        (_lex: Lexicon) => value.join(""),
        new CompoundLexType(LexRoot.Lexicon, LexRoot.String)
      )
  )
);

NaturalParser.setPattern(
  parserRules.NUMBER,
  apply(
    seq(
      tok(TokenKind.Numeric),
      opt_sc(kright(str("."), tok(TokenKind.Numeric)))
    ),
    ([value, decimal]: [
        Token<TokenKind.Numeric>,
        undefined | Token<TokenKind.Numeric>
      ]) =>
      (_lex: Lexicon) =>
        new XBar(
          (_lex: Lexicon) =>
            Number(
              value.text + (decimal != undefined ? `.${decimal.text}` : "")
            ),
          new CompoundLexType(LexRoot.Lexicon, LexRoot.Number)
        )
  )
);
NaturalParser.setPattern(
  parserRules.PUNCTUATION,
  apply(
    alt_sc(str("."), str("!")),
    () => (_lex: Lexicon) =>
      new XBar(
        (phrase: (_lex: Lexicon) => void) => (lex: Lexicon) => phrase(lex), // TODO Punctuation differences?
        new CompoundLexType(
          new CompoundLexType(LexRoot.Lexicon, LexRoot.Void),
          new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
        )
      )
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
          alt_sc(parserRules.WORD, parserRules.NUMBER, parserRules.STRING)
          // TODO *[REWORK]* Change this to be "tokens" with types so that the argument acceptor can read them
        )
      ),
      parserRules.PUNCTUATION
    ),
    ([verb, sentenceTokens, punctuation]: [
      PreLexXBar,
      PreLexXBar[],
      PreLexXBar
    ]) => combineReduce(verb, sentenceTokens.concat([punctuation]))
  )
);

NaturalParser.setPattern(
  parserRules.PARAGRAPH,
  apply(
    rep_sc(kleft(parserRules.SENTENCE, opt_sc(str(" ")))),
    (sentences: PreLexXBar[]) => {
      return (lex: Lexicon) =>
        new XBar(
          sentences.reduce(
            (acc: () => void, e: PreLexXBar) => {
              return () => {
                acc();
                e(lex).run(lex);
              };
            },
            () => null
          ),
          new CompoundLexType(LexRoot.Lexicon, LexRoot.Void)
        );
    }
  )
);

interface frameReturn {
  newArg: XBar;
  size: number;
}

type frame = [string, (restOfSentence: XBar[]) => frameReturn | undefined];

const framesToAccept: frame[] = [
  [
    "BaseFrame",
    (restOfSentence: XBar[]) => ({ newArg: restOfSentence[0], size: 1 }),
  ],
  [
    "TheValueOfFrame",
    (restOfSentence: XBar[]) => {
      if (restOfSentence[0].symbol != "the") return undefined;
      if (restOfSentence[1].symbol != "value") return undefined;
      if (restOfSentence[2].symbol != "of") return undefined;
      return {
        newArg: new XBar(
          (lex: Lexicon) => lex.lookup(restOfSentence[3].symbol),
          new CompoundLexType(
            LexRoot.Lexicon,
            LexRoot.ValueObject(LexRoot.Stringable)
          )
        ),
        size: 4,
      };
    },
  ],
  // TODO For Loop frame
  // TODO Variable frame
];

function combineReduce(
  inputPreLex: PreLexXBar,
  restOfSentence: PreLexXBar[]
): PreLexXBar {
  return (lex: Lexicon) => {
    const currentTree = inputPreLex(lex);
    const XBars = restOfSentence.map((token: PreLexXBar) => token(lex));
    return combineReduceFactory(XBars)(currentTree);
  };
}

function combineReduceFactory(remainingArgs: XBar[]) {
  return function combineReduceHelper(currentTree: XBar): XBar {
    if (remainingArgs.length == 0) return currentTree;
    const possibleArgs = framesToAccept
      .map(([_frameName, frameFx]: frame) => frameFx(remainingArgs))
      .filter((value: frameReturn | undefined) => value != undefined);
    const bestArg = largest(possibleArgs, (e: frameReturn) => e.size);
    for (let i = 0; i < bestArg.value; i++) remainingArgs.shift();
    return combineReduceHelper(
      XBar.createParent(currentTree, bestArg.element.newArg)
    );
  };
}

function largest<T>(
  arr: T[],
  key: (e: T) => number
): { element: T; value: number } {
  const maxElement = [...arr].sort(key)[arr.length - 1];
  return {
    element: maxElement,
    value: key(maxElement),
  };
}
