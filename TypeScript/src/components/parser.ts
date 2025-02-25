import {
  alt,
  apply,
  combine,
  kleft,
  kmid,
  list_sc,
  rep_sc,
  str,
  tok,
  Token,
} from "typescript-parsec";
import {
  buildLexer,
  expectEOF,
  expectSingleResult,
  rule,
} from "typescript-parsec";

import { tree_node } from "../structures/tree_node";
import {
  BasicTypes,
  compose,
  Compound_Type,
} from "../structures/semantic_type";
import { semantic_state } from "../structures/semantic_state";
import { loadLexicon } from "./lexicon";

export { evaluate };

enum TokenKind {
  Numeric,
  Alpha,
  Space,
  NewLine,
  Quote,
  Other,
}

// DEFINE TOKEN TYPES
const lexer = buildLexer([
  [true, /^[0-9]*/g, TokenKind.Numeric],
  [true, /^[a-zA-Z]*/g, TokenKind.Alpha],
  [false, /^ /g, TokenKind.Space],
  [true, /^\n/g, TokenKind.NewLine],
  [true, /^['"]/g, TokenKind.Quote],
  [true, /^./g, TokenKind.Other],
]);

const DEBUG = false;

function debug(text: string) {
  return (value: any) => {
    if (DEBUG) {
      console.log(value);
    }
    return value;
  };
}

// DEFINE NON_TERMINAL TYPES
//const NONTERMINAL = rule<TokenKind, ruleOutput>();
const PRGM = rule<TokenKind, tree_node>();
const PARAGRAPH = rule<TokenKind, tree_node>();
const SENTENCE = rule<TokenKind, tree_node>();
const IMPERATIVE = rule<TokenKind, tree_node>();
const VERB_PHRASE = rule<TokenKind, tree_node>();
const VERB = rule<TokenKind, tree_node>();
const ARGUMENT = rule<TokenKind, tree_node>();
const LITERAL = rule<TokenKind, tree_node>();
const STRING_CHARACTER = rule<TokenKind, Token<TokenKind>>();

const parent_state = new semantic_state(null);
loadLexicon(parent_state);

// OVERHEAD FOR BLOCKING AND LINES
PRGM.setPattern(
  apply(
    apply(PARAGRAPH, (value: tree_node) => {
      value.state = parent_state;
      value.assignStates();
    }),
    debug("prgm")
  )
);
PARAGRAPH.setPattern(
  apply(
    apply(
      list_sc(SENTENCE, tok(TokenKind.NewLine)),
      (sentences: tree_node[]) => {
        let para = new tree_node(
          "Paragraph",
          compose(BasicTypes.VOID, BasicTypes.VOID),
          () => sentences.forEach((sentence) => sentence.value())
        );
        sentences.forEach((sentence: tree_node) => sentence.set_parent(para));
        return para;
      }
    ),
    debug("paragraph")
  )
);
SENTENCE.setPattern(apply(IMPERATIVE, debug("sentence")));
IMPERATIVE.setPattern(apply(kleft(VERB_PHRASE, str(".")), debug("imperative")));

// ACTUAL SENTENCE PARSING
VERB_PHRASE.setPattern(
  apply(
    combine(VERB, (verb: tree_node) => {
      return apply(ARGUMENT, (arg: tree_node) => {
        let verb_phrase = new tree_node(
          "Verb Phrase",
          (verb.value_type as Compound_Type).output,
          verb.value(arg)
        );
        verb.set_parent(verb_phrase);
        arg.set_parent(verb_phrase);
        return verb_phrase;
      });
    }),
    debug("verb_phrase")
  )
);

VERB.setPattern(
  apply(
    apply(tok(TokenKind.Alpha), (verb: any) => {
      // GRAB ACTUAL VERB DEFINITION AND SUB IN HERE NORMALLY
      return new tree_node(
        "Verb",
        compose(BasicTypes.ANY, compose(BasicTypes.VOID, BasicTypes.VOID)),
        (argument: tree_node) => () => console.log(argument.value)
      );
    }),
    debug("verb")
  )
);

ARGUMENT.setPattern(apply(LITERAL, debug("argument")));

LITERAL.setPattern(
  apply(
    alt(
      apply(tok(TokenKind.Numeric), (value: Token<TokenKind.Numeric>) =>
        tree_node.literal(Number(value.text))
      ),
      apply(
        combine(tok(TokenKind.Quote), (quote: Token<TokenKind.Quote>) => {
          return kleft(
            rep_sc(alt(STRING_CHARACTER, str(quote.text == "'" ? '"' : "'"))),
            str(quote.text)
          );
        }),
        (stringLit: Token<any>[]) =>
          tree_node.literal(
            stringLit.reduce(
              (
                acc: string,
                e: Token<TokenKind.Alpha> | Token<TokenKind.Numeric>
              ) => {
                return acc + e.text;
              },
              ""
            )
          )
      )
    ),
    debug("literal")
  )
);

STRING_CHARACTER.setPattern(alt(tok(TokenKind.Alpha), tok(TokenKind.Numeric)));

function evaluate(expr: string): (x: void) => void {
  return expectSingleResult(expectEOF(PRGM.parse(lexer.parse(expr)))).value;
}
