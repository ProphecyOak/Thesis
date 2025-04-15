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

enum SentenceTokenType {
  Number,
  String,
  Word,
}

interface SentenceToken {
  symbol: string;
  type: SentenceTokenType;
}
type PreLexXBar = (lex: Lexicon) => XBar;

const parserRules = {
  PARAGRAPH: rule<TokenKind, PreLexXBar>(),
  SENTENCE: rule<TokenKind, PreLexXBar>(),
  WORD: rule<TokenKind, SentenceToken>(),
  NUMBER: rule<TokenKind, SentenceToken>(),
  STRING: rule<TokenKind, SentenceToken>(),
  PUNCTUATION: rule<TokenKind, XBar>(),
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
              kright(str("\\"), alt_sc(str("\\"), str(quote.text))),
              tok(TokenKind.Other)
            ),
            (token: Token<TokenKind>) => token.text
          )
        ),
        str(quote.text)
      )
    ),
    (value: string[]) => ({
      symbol: value.join(""),
      type: SentenceTokenType.String,
    })
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
    ]) => ({
      symbol: value.text + (decimal != undefined ? `.${decimal.text}` : ""),
      type: SentenceTokenType.Number,
    })
  )
);
NaturalParser.setPattern(
  parserRules.PUNCTUATION,
  apply(
    alt_sc(str("."), str("!")),
    () =>
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
  apply(tok(TokenKind.Alpha), (symbol: Token<TokenKind.Alpha>) => ({
    symbol: symbol.text,
    type: SentenceTokenType.Word,
  }))
);

function composeEmAll(
  verb: SentenceToken,
  verbArgs: PreLexXBar[],
  punctuation: XBar
): PreLexXBar {
  return (lex: Lexicon) => {
    let outXBar = lex.lookup(verb.symbol);
    let newArg = verbArgs.shift();
    while (newArg != undefined) {
      outXBar = XBar.createParent(outXBar, newArg!(lex));
      newArg = verbArgs.shift();
    }
    outXBar = XBar.createParent(outXBar, punctuation);
    return outXBar;
  };
}

interface Frame {
  name: string;
  pattern: Parser<TokenKind, PreLexXBar>;
}
const frames = new Map<string, Frame>();

function addFrame(name: string, pattern: Parser<TokenKind, PreLexXBar>) {
  frames.set(name, {
    name,
    pattern,
  });
}

addFrame(
  "Literal",
  alt_sc(
    apply(
      parserRules.STRING,
      (literal: SentenceToken) => (_lex: Lexicon) =>
        new XBar(
          () => ({ get: () => literal.symbol, type: LexRoot.String }),
          new CompoundLexType(LexRoot.Lexicon, LexRoot.String),
          literal.symbol
        )
    ),
    apply(
      parserRules.NUMBER,
      (literal: SentenceToken) => (_lex: Lexicon) =>
        new XBar(
          () => ({ get: () => Number(literal.symbol), type: LexRoot.Number }),
          new CompoundLexType(LexRoot.Lexicon, LexRoot.Number),
          literal.symbol
        )
    )
  )
);

const variableValuePattern: Parser<TokenKind, SentenceToken> = kright(
  seq(str("the"), str(" "), str("value"), str(" "), str("of"), str(" ")),
  parserRules.WORD
);

addFrame(
  "The Value Of",
  apply(variableValuePattern, (word: SentenceToken) => (lex: Lexicon) => {
    const definedWord = lex.lookup(word.symbol);
    return XBar.createParent(
      definedWord,
      new XBar(
        (valueObj: { value: unknown }) => () => ({
          get: () => valueObj.value,
        }),
        new CompoundLexType(
          LexRoot.ValueObject(LexRoot.Stringable),
          new CompoundLexType(LexRoot.Lexicon, LexRoot.Stringable)
        )
      )
    );
  })
);

addFrame(
  "As Destination",
  apply(
    kright(seq(str("as"), str(" ")), variableValuePattern),
    (word: SentenceToken) => (_lex: Lexicon) => {
      return new XBar(
        {
          get: () => word.symbol,
        },
        LexRoot.Stringable
      );
    }
  )
);

const altFrame = (() => {
  const argFrames = Array.from(frames.values()).map(
    (value: Frame) => value.pattern
  );
  let outAlt = argFrames.shift()!;
  for (let i = 0; i < argFrames.length; i++)
    outAlt = alt_sc(outAlt, argFrames[i]);
  return outAlt;
})();

NaturalParser.setPattern(
  parserRules.SENTENCE,
  apply(
    seq(
      parserRules.WORD,
      rep_sc(kright(opt_sc(str(" ")), altFrame)),
      parserRules.PUNCTUATION
    ),
    ([verb, verbArgs, punctuation]: [SentenceToken, PreLexXBar[], XBar]) =>
      composeEmAll(verb, verbArgs, punctuation)
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
