import {
  alt,
  apply,
  kleft,
  kmid,
  list_sc,
  rep_sc,
  seq,
  str,
  Token,
} from "typescript-parsec";
import {
  buildLexer,
  expectEOF,
  expectSingleResult,
  rule,
} from "typescript-parsec";

export { evaluate };

enum TokenKind {
  Any,
}

// DEFINE TOKEN TYPES
const lexer = buildLexer([[true, /^./g, TokenKind.Any]]);

// DEFINE NON_TERMINAL TYPES
//const NONTERMINAL = rule<TokenKind, ruleOutput>();
const PRGM = rule<TokenKind, () => void>();
const PARAGRAPH = rule<TokenKind, () => void>();
const SENTENCE = rule<TokenKind, () => void>();
const IMPERATIVE = rule<TokenKind, () => void>();
const VERB_PHRASE = rule<TokenKind, () => void>();

PRGM.setPattern(PARAGRAPH);

PARAGRAPH.setPattern(apply(list_sc(SENTENCE, str("\n")), concatenateFunctions));

SENTENCE.setPattern(IMPERATIVE);

IMPERATIVE.setPattern(kleft(VERB_PHRASE, str(".")));

function concatenateFunctions(fs: (() => void)[]): () => void {
  return () => {
    fs.forEach((element) => element());
  };
}

function evaluate(expr: string): () => void {
  return expectSingleResult(expectEOF(PRGM.parse(lexer.parse(expr))));
}
