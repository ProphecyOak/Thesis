import {
  alt,
  apply,
  combine,
  kleft,
  kmid,
  list_sc,
  rep_sc,
  seq,
  str,
  tok,
} from "typescript-parsec";
import {
  buildLexer,
  expectEOF,
  expectSingleResult,
  rule,
} from "typescript-parsec";

import { semanticFunction } from "./lexicon";
import {
  BasicTypes,
  compose,
  Compound_Type,
} from "../structures/semantic_type";

export { evaluate };

enum TokenKind {
  Numeric,
  Alpha,
  Space,
  Other,
}

// DEFINE TOKEN TYPES
const lexer = buildLexer([
  [true, /^[0-9]*/g, TokenKind.Numeric],
  [true, /^[a-zA-Z]*/g, TokenKind.Alpha],
  [false, /^\s/g, TokenKind.Space],
  [true, /^./g, TokenKind.Other],
]);

const DEBUG = false;

function debug(text: string) {
  return (value: any) => {
    if (DEBUG) {
      console.log(
        text,
        typeof value === "object" ? value.constructor.name : typeof value
      );
      console.log(value);
    }
    return value;
  };
}

// DEFINE NON_TERMINAL TYPES
//const NONTERMINAL = rule<TokenKind, ruleOutput>();
const PRGM = rule<TokenKind, semanticFunction>();
const PARAGRAPH = rule<TokenKind, semanticFunction>();
const SENTENCE = rule<TokenKind, semanticFunction>();
const IMPERATIVE = rule<TokenKind, semanticFunction>();
const VERB_PHRASE = rule<TokenKind, semanticFunction>();
const VERB = rule<TokenKind, semanticFunction>();
const ARGUMENT = rule<TokenKind, semanticFunction>();
const LITERAL = rule<TokenKind, semanticFunction>();

// OVERHEAD FOR BLOCKING AND LINES
PRGM.setPattern(apply(PARAGRAPH, debug("prgm")));
PARAGRAPH.setPattern(
  apply(
    apply(list_sc(SENTENCE, str("\n")), concatenateFunctions),
    debug("paragraph")
  )
);
SENTENCE.setPattern(apply(IMPERATIVE, debug("sentence")));
IMPERATIVE.setPattern(apply(kleft(VERB_PHRASE, str(".")), debug("imperative")));

// ACTUAL SENTENCE PARSING
VERB_PHRASE.setPattern(
  apply(
    combine(VERB, (verb: semanticFunction) => {
      return apply(ARGUMENT, (arg: semanticFunction) =>
        composeFunctions(verb, arg)
      );
    }),
    debug("verb_phrase")
  )
);

VERB.setPattern(
  apply(
    apply(tok(TokenKind.Alpha), (verb: any) => {
      // GRAB ACTUAL VERB DEFINITION AND SUB IN HERE NORMALLY
      return new semanticFunction(
        (argument: any) => {
          console.log(argument.meaning);
        },
        compose(BasicTypes.ANY, compose(BasicTypes.VOID, BasicTypes.VOID))
      );
    }),
    debug("verb")
  )
);

ARGUMENT.setPattern(apply(LITERAL, debug("argument")));

LITERAL.setPattern(
  apply(
    apply(
      alt(
        tok(TokenKind.Numeric),
        kmid(
          str('"'),
          rep_sc(alt(tok(TokenKind.Alpha), tok(TokenKind.Numeric))),
          str('"')
        )
      ),
      (value: any) => {
        return semanticFunction.literal(value.text);
      }
    ),
    debug("literal")
  )
);

function concatenateFunctions(fs: semanticFunction[]): semanticFunction {
  return new semanticFunction(
    () => {
      fs.forEach((element) => element.meaning());
    },
    compose(BasicTypes.VOID, BasicTypes.VOID)
  );
}

function composeFunctions(
  f: semanticFunction,
  argument: semanticFunction
): semanticFunction {
  if (f.semantic_type.simple || !f.takes(argument)) throw new TypeError();
  return new semanticFunction(
    () => f.meaning(argument),
    (f.semantic_type as Compound_Type).output
  );
}

function evaluate(expr: string): semanticFunction {
  return expectSingleResult(expectEOF(PRGM.parse(lexer.parse(expr))));
}
