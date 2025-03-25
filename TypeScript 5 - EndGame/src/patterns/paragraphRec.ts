import { alt, apply, list_sc, str } from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules } from "../header";
import { LexValue } from "../components/xValue";
import { SymbolTable } from "../components/lexicon";

pattern(
  parserRules.PARAGRAPH,
  apply(
    list_sc(parserRules.SENTENCE, alt(str("\n"), str(" "))),
    (sentences: LexValue<any>[]) => (lookup: SymbolTable<any>) =>
      sentences.forEach((sentence: LexValue<any>) => {
        sentence.attachTable(lookup);
        sentence.getValue()();
      })
  )
);

//  FIGURE OUT HOW TO INCLUDE DESTINATION THING
//  FIX THE 5 CALLS TO THEME????
