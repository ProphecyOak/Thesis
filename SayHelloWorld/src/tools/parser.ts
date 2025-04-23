import {
  alt,
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
import { Lexicon, XBar } from "../structure/xBar";
import {
  CompoundSemanticType,
  LexRoot,
  ObjectSemanticType,
} from "../structure/semantic_type";

// List of different tokenkinds to be regex'd
export enum TokenKind {
  Numeric,
  Alpha,
  Space,
  NewLine,
  Quote,
  BackSlash,
  Other,
}

// An enum for the types of sentence tokens so that various
// frames know what kind of word they are getting.
enum SentenceTokenType {
  Number,
  String,
  Word,
}

// Contains the received word/number/string and the type for checks down the line.
interface SentenceToken {
  symbol: string;
  type: SentenceTokenType;
}

// A utility type for XBars that need to wait for context to be resolved.
type PreLexXBar = (lex: Lexicon) => XBar;

// Defines which rules are gonna be available to parse (and reuse).
// Does not include frames for arguments.
const parserRules = {
  PARAGRAPH: rule<TokenKind, PreLexXBar>(),
  SENTENCE: rule<TokenKind, PreLexXBar>(),
  WORD: rule<TokenKind, SentenceToken>(),
  NUMBER: rule<TokenKind, SentenceToken>(),
  STRING: rule<TokenKind, SentenceToken>(),
  PUNCTUATION: rule<TokenKind, PreLexXBar>(),
};

// Class to hold onto all the parser bits for external use.
export class NaturalParser {
  // Externalizes the TokenKind enum.
  static TokenKind = TokenKind;

  // Defines the regex for each token type.
  static lexer = buildLexer([
    [true, /^[0-9]+/g, TokenKind.Numeric],
    [true, /^[a-zA-Z]+/g, TokenKind.Alpha],
    [true, /^ /g, TokenKind.Space],
    [true, /^\n/g, TokenKind.NewLine],
    [true, /^['"]/g, TokenKind.Quote],
    [true, /^\\/g, TokenKind.BackSlash],
    [true, /^./g, TokenKind.Other],
  ]);

  //
  static parserRules = parserRules;

  //Returns the appropriate XBar given text.
  static evaluate(
    sentence: string,
    lexicon: Lexicon,
    rule: Rule<TokenKind, PreLexXBar>
  ): XBar[] {
    const parseResults = expectEOF(
      rule.parse(NaturalParser.lexer.parse(sentence))
    );
    const parseResult = expectSingleResult(parseResults)(lexicon);
    return [parseResult];
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
  alt(
    apply(alt(str("."), str("!")), (punctuationMark: Token<TokenKind>) => {
      return () =>
        new XBar(
          (phrase: (_lex: Lexicon) => void) => (lex: Lexicon) => phrase(lex), // TODO Punctuation differences?
          new CompoundSemanticType(
            new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void),
            new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
          ),
          punctuationMark.text
        );
    }),
    apply(
      kright(seq(str(":"), opt_sc(str(" "))), parserRules.SENTENCE),
      (sentence: PreLexXBar) => (lex: Lexicon) =>
        new XBar(
          sentence(lex).value,
          new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void),
          ":"
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
  punctuation: PreLexXBar
): PreLexXBar {
  return (lex: Lexicon) => {
    let outXBar = lex.lookup(verb.symbol);
    let newArg = verbArgs.shift();
    while (newArg != undefined) {
      outXBar = XBar.createParent(outXBar, newArg!(lex));
      newArg = verbArgs.shift();
    }
    outXBar = XBar.createParent(outXBar, punctuation(lex));
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
      (literal: SentenceToken) => () =>
        new XBar(
          () => ({ get: () => literal.symbol, type: LexRoot.String }),
          new CompoundSemanticType(LexRoot.Lexicon, LexRoot.String),
          literal.symbol
        )
    ),
    apply(
      parserRules.NUMBER,
      (literal: SentenceToken) => () =>
        new XBar(
          () => ({ get: () => Number(literal.symbol), type: LexRoot.Number }),
          new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Number),
          literal.symbol
        )
    ),
    apply(
      alt_sc(str("true"), str("false")),
      (val: Token<TokenKind>) => (lex: Lexicon) => lex.lookup(val.text)
    )
  )
);

const variableValuePattern: Parser<TokenKind, [SentenceToken, SentenceToken]> =
  apply(
    seq(
      kright(seq(str("the"), str(" ")), parserRules.WORD),
      kright(seq(str(" "), str("of"), str(" ")), parserRules.WORD)
    ),
    ([property, word]: [SentenceToken, SentenceToken]) => [word, property]
  );
const variablePossesivePattern: Parser<
  TokenKind,
  [SentenceToken, SentenceToken]
> = seq(
  kleft(parserRules.WORD, seq(str("'"), str("s"), str(" "))),
  parserRules.WORD
);

addFrame(
  "The Value Of",
  alt(
    apply(
      variableValuePattern,
      ([word, property]: [SentenceToken, SentenceToken]) =>
        (lex: Lexicon) => {
          if (property.symbol.toLowerCase() != "value")
            throw new Error("You can only grab values right now.");
          const definedWord = lex.lookup(word.symbol);
          return XBar.createParent(
            new XBar(
              (valueObj: Map<string, unknown>) => () => ({
                get: () => valueObj.get("value"),
              }),
              new CompoundSemanticType(
                definedWord.type,
                new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable)
              ),
              `the ${property.symbol} of`
            ),
            definedWord
          );
        }
    ),
    apply(
      variablePossesivePattern,
      ([word, property]: [SentenceToken, SentenceToken]) =>
        (lex: Lexicon) => {
          if (property.symbol.toLowerCase() != "value")
            throw new Error("You can only grab values right now.");
          const definedWord = lex.lookup(word.symbol);
          return XBar.createParent(
            new XBar(
              (valueObj: Map<string, unknown>) => () => ({
                get: () => valueObj.get("value"),
              }),
              new CompoundSemanticType(
                definedWord.type,
                new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable)
              ),
              `${property.symbol} of`
            ),
            definedWord
          );
        }
    )
  )
);

addFrame(
  "As Destination",
  apply(
    kright(
      seq(str("as"), str(" ")),
      alt(variableValuePattern, variablePossesivePattern)
    ),
    ([word, property]: [SentenceToken, SentenceToken]) =>
      () =>
        new XBar(
          {
            get: () => word.symbol,
          },
          LexRoot.String,
          `as the ${property.symbol} of ${word.symbol}`
        )
  )
);

addFrame(
  "To Variable",
  apply(
    kright(
      seq(str("to"), str(" ")),
      alt(variableValuePattern, variablePossesivePattern)
    ),
    ([word, property]: [SentenceToken, SentenceToken]) =>
      () =>
        new XBar(
          (
              fx: (
                secondArg: (lex: Lexicon) => { get: () => string | number }
              ) => (lex: Lexicon) => string | number
            ) =>
            (lex: Lexicon) => {
              lex.modify(
                word.symbol,
                property.symbol,
                fx((lex: Lexicon) => {
                  const variable = lex.lookup(word.symbol) as XBar;
                  return {
                    get: () =>
                      (variable.value as Map<string, string | number>).get(
                        "value"
                      )!,
                    type: (variable.type as ObjectSemanticType).types.get(
                      "value"
                    ),
                  };
                })(lex)
              );
            },
          new CompoundSemanticType(
            new CompoundSemanticType(
              new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable),
              new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Stringable)
            ),
            new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
          ),
          `to the ${property.symbol} of ${word.symbol}`
        )
  )
);

addFrame(
  "X Times",
  apply(
    apply(
      kleft(
        alt(
          frames.get("The Value Of")!.pattern,
          frames.get("Literal")!.pattern
        ),
        seq(str(" "), str("times"))
      ),
      (oldValue: PreLexXBar) => (lex: Lexicon) => {
        const lexedBar = oldValue(lex);
        return new XBar(
          lexedBar.value,
          new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Number),
          lexedBar.symbol
        );
      }
    ),
    (iterationCount: PreLexXBar) => (lex: Lexicon) =>
      XBar.createParent(
        iterationCount(lex),
        new XBar(
          (value: (lex: Lexicon) => { get: () => number }) =>
            (phrase: (_lex: Lexicon) => void) =>
            (lex: Lexicon) => {
              for (let i = 0; i < value(lex).get(); i++) phrase(lex);
            },
          new CompoundSemanticType(
            new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Number),
            new CompoundSemanticType(
              new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void),
              new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
            )
          ),
          "times"
        )
      )
  )
);

addFrame(
  "Each X",
  apply(
    kright(seq(str("each"), str(" ")), parserRules.WORD),
    (word: SentenceToken) => () => {
      return new XBar(
        {
          get: () => word.symbol,
        },
        LexRoot.String,
        `each ${word.symbol} in`
      );
    }
  )
);

addFrame(
  "In Iterable",
  kright(
    seq(str("in"), str(" ")),
    alt(
      apply(
        parserRules.STRING,
        (iterable: SentenceToken) => () =>
          new XBar(
            { get: () => Array.from(iterable.symbol) },
            LexRoot.Iterable,
            `[${iterable.symbol}]`
          )
      ),
      apply(
        frames.get("The Value Of")!.pattern,
        (variable: PreLexXBar) => (lex: Lexicon) => {
          const definedWord = variable(lex);
          const iterable: string = (
            definedWord.value as { get: () => string }
          ).get();
          return new XBar(
            { get: () => Array.from(iterable) },
            LexRoot.Iterable,
            `[${iterable}]`
          );
        }
      )
    )
  )
);

addFrame(
  "Is (Equality)",
  apply(
    seq(
      kleft(
        alt(
          frames.get("The Value Of")!.pattern,
          frames.get("Literal")!.pattern
        ),
        seq(str(" "), str("is"), str(" "))
      ),
      alt(frames.get("The Value Of")!.pattern, frames.get("Literal")!.pattern)
    ),
    ([value1, value2]: [PreLexXBar, PreLexXBar]) =>
      (lex: Lexicon) => {
        const XBar1 = value1(lex);
        const XBar2 = value2(lex);
        const boolXBar = new XBar(
          () => ({
            get: () =>
              (XBar1.value as (lex: Lexicon) => { get: () => unknown })(
                lex
              ).get() ==
              (XBar2.value as (lex: Lexicon) => { get: () => unknown })(
                lex
              ).get(),
          }),
          new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Boolean),
          `${XBar1.symbol} == ${XBar2.symbol}`
        );
        boolXBar.children = [XBar1, XBar2];
        return boolXBar;
      }
  )
);

// TODO: PLUS FRAME

addFrame(
  "Trailing Conditional",
  apply(
    kright(
      seq(str("if"), str(" ")),
      alt(
        frames.get("The Value Of")!.pattern,
        frames.get("Literal")!.pattern,
        frames.get("Is (Equality)")!.pattern
      )
    ),
    (condition: PreLexXBar) => (lex: Lexicon) =>
      XBar.createParent(
        condition(lex),
        new XBar(
          (value: (lex: Lexicon) => { get: () => boolean }) =>
            (phrase: (_lex: Lexicon) => void) =>
            (lex: Lexicon) => {
              if (value(lex).get()) phrase(lex);
            },
          new CompoundSemanticType(
            new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Boolean),
            new CompoundSemanticType(
              new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void),
              new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
            )
          ),
          "times"
        )
      )
  )
);

const altFrame = (() => {
  const argFrames = Array.from(frames.values()).map(
    (value: Frame) => value.pattern
  );
  let outAlt = argFrames.shift()!;
  for (let i = 0; i < argFrames.length; i++) outAlt = alt(outAlt, argFrames[i]);
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
    ([verb, verbArgs, punctuation]: [
      SentenceToken,
      PreLexXBar[],
      PreLexXBar
    ]) => composeEmAll(verb, verbArgs, punctuation)
  )
);

NaturalParser.setPattern(
  parserRules.PARAGRAPH,
  apply(
    rep_sc(kleft(parserRules.SENTENCE, opt_sc(str(" ")))),
    (sentences: PreLexXBar[]) => {
      return (lex: Lexicon) => {
        const lexedSentences: XBar[] = [];
        const outXBar = new XBar(
          sentences.reduce(
            (acc: () => void, e: PreLexXBar) => {
              return () => {
                acc();
                lexedSentences.push(e(lex));
                lexedSentences[lexedSentences.length - 1].run(lex);
              };
            },
            () => null
          ),
          new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
        );
        outXBar.children = lexedSentences;
        return outXBar;
      };
    }
  )
);
