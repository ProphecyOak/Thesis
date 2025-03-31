import { alt, apply, list_sc, str } from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, XBarInterface } from "../header";
import { SymbolTable } from "../components/lexicon";

pattern(
  parserRules.PARAGRAPH,
  apply(
    list_sc(parserRules.SENTENCE, alt(str("\n"), str(" "))),
    (sentences: XBarInterface[]) => (lookup: SymbolTable) =>
      sentences.forEach((sentence: XBarInterface) => {
        sentence.assignLookup(lookup);
        sentence.root.getValue()().assignLookup(lookup).run();
      })
  )
);
