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
  fail,
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
  combine(opt_sc(str("-")), (negative: undefined | Token<TokenKind>) =>
    apply(
      seq(
        tok(TokenKind.Numeric),
        opt_sc(kright(str("."), tok(TokenKind.Numeric)))
      ),
      ([value, decimal]: [
        Token<TokenKind.Numeric>,
        undefined | Token<TokenKind.Numeric>
      ]) => ({
        symbol:
          (negative != undefined ? "-" : "") +
          value.text +
          (decimal != undefined ? `.${decimal.text}` : ""),
        type: SentenceTokenType.Number,
      })
    )
  )
);

function memo<T>(fx: () => T) {
  let resolved = false;
  let result: T;
  return () => {
    if (!resolved) {
      result = fx();
    }
    resolved = true;
    return result;
  };
}

NaturalParser.setPattern(
  parserRules.PUNCTUATION,
  alt(
    apply(alt(str("."), str("!")), (punctuationMark: Token<TokenKind>) => {
      return () =>
        new XBar(
          (phrase: (_lex: Lexicon) => void) => (lex: Lexicon) => phrase(lex),
          new CompoundSemanticType(
            new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void),
            new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
          ),
          punctuationMark.text
        );
    }),
    apply(
      kright(seq(str(":"), opt_sc(str(" "))), parserRules.SENTENCE),
      (sentence: PreLexXBar) => () =>
        XBar.createParent(
          new XBar(
            (block: (lex: Lexicon) => { value: () => void }) =>
              (lex: Lexicon) =>
                memo(() => block(lex).value)(),
            new CompoundSemanticType(
              new CompoundSemanticType(
                LexRoot.Lexicon,
                new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
              ),
              new CompoundSemanticType(
                LexRoot.Lexicon,
                new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
              )
            ),
            ":"
          ),
          new XBar(
            sentence,
            new CompoundSemanticType(
              LexRoot.Lexicon,
              new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
            )
          )
        )
    ),
    apply(
      kright(
        seq(str(","), str(" "), str("and"), str(" ")),
        parserRules.SENTENCE
      ),
      (sentence: PreLexXBar) => () =>
        new XBar(
          (firstSentence: (lex: Lexicon) => void) => (lex: Lexicon) =>
            memo(() => {
              firstSentence(lex);
              sentence(lex).run(lex);
            })(),
          new CompoundSemanticType(
            new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void),
            new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void)
          ),
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
    let i = 0;
    while (i < verbArgs.length) {
      outXBar = XBar.createParent(outXBar, verbArgs[i](lex));
      i++;
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

// STRETCH "THE" INSIDE LOOPS

const prepositionPattern: Parser<TokenKind, PreLexXBar> = fail(
  "No prepositions defined yet."
);

const modifiedValuePattern: Parser<TokenKind, PreLexXBar> = apply(
  seq(
    apply(
      alt(variableValuePattern, variablePossesivePattern),
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
    rep_sc(kright(opt_sc(str(" ")), prepositionPattern))
  ),
  // FIXME prep phrase handling.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ([initialValue, _phrases]: [PreLexXBar, PreLexXBar[]]) => {
    return initialValue;
  }
);

addFrame("The Value Of", modifiedValuePattern);

// REWORK replace with "AS" preposition
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

// REWORK replace with "TO" preposition
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

// TODO ADD A PREPOSITION LIST!!! :)

// REWORK replace with "IN" preposition
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
      seq(
        alt(
          frames.get("The Value Of")!.pattern,
          frames.get("Literal")!.pattern
        ),
        kleft(
          kright(
            seq(str(" "), str("is")),
            opt_sc(
              kright(
                str(" "),
                alt(
                  apply(seq(str("greater"), str(" "), str("than")), () => "GT"),
                  apply(seq(str("less"), str(" "), str("than")), () => "LT")
                )
              )
            )
          ),
          str(" ")
        )
      ),
      alt(frames.get("The Value Of")!.pattern, frames.get("Literal")!.pattern)
    ),
    ([[value1, comparison], value2]: [
      [PreLexXBar, string | undefined],
      PreLexXBar
    ]) => {
      let logicFunction: (a: unknown, b: unknown) => boolean;
      switch (comparison) {
        case "LT":
          logicFunction = (a: unknown, b: unknown) => {
            if (typeof a == "number" && typeof b == "number") return a < b;
            if (typeof a == "string" && typeof b == "string")
              return a.length < b.length;
            throw new Error(
              `Cannot tell whether a ${typeof a} is less than a ${typeof b}`
            );
          };
          break;
        case "GT":
          logicFunction = (a: unknown, b: unknown) => {
            if (typeof a == "number" && typeof b == "number") return a > b;
            if (typeof a == "string" && typeof b == "string")
              return a.length > b.length;
            throw new Error(
              `Cannot tell whether a ${typeof a} is greater than a ${typeof b}`
            );
          };
          break;
        default:
          logicFunction = (a: unknown, b: unknown) => {
            if (typeof a == "number" && typeof b == "number") return a == b;
            if (typeof a == "string" && typeof b == "string") return a == b;
            if (typeof a == "boolean" && typeof b == "boolean") return a == b;
            throw new Error(
              `Cannot tell whether a ${typeof a} is equal to a ${typeof b}`
            );
          };
          break;
      }
      return (lex: Lexicon) => {
        const XBar1 = value1(lex);
        const XBar2 = value2(lex);
        const boolXBar = new XBar(
          () => ({
            get: () =>
              logicFunction(
                (XBar1.value as (lex: Lexicon) => { get: () => unknown })(
                  lex
                ).get(),
                (XBar2.value as (lex: Lexicon) => { get: () => unknown })(
                  lex
                ).get()
              ),
          }),
          new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Boolean),
          `${XBar1.symbol} == ${XBar2.symbol}`
        );
        boolXBar.children = [XBar1, XBar2];
        return boolXBar;
      };
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
    (sentences: PreLexXBar[]) => (lex: Lexicon) => {
      const futureChildren: XBar[] = [];
      const paraValue = sentences.reduce(
        (acc: () => void, e: PreLexXBar) => () => {
          acc();
          futureChildren.push(e(lex));
          futureChildren[futureChildren.length - 1].run(lex);
        },
        () => null
      );
      const outXBar = new XBar(
        paraValue,
        new CompoundSemanticType(LexRoot.Lexicon, LexRoot.Void),
        "Paragraph",
        futureChildren
      );
      return outXBar;
    }
  )
);
