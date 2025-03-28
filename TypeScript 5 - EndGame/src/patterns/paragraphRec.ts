import { alt, apply, list_sc, str } from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, XBarInterface } from "../header";
import { SymbolTable } from "../components/lexicon";
import { XBar } from "../components/wordArgument";

pattern(
  parserRules.PARAGRAPH,
  apply(
    list_sc(parserRules.SENTENCE, alt(str("\n"), str(" "))),
    (sentences: XBarInterface[]) => (lookup: SymbolTable<any>) =>
      sentences.forEach((sentence: XBarInterface) => {
        sentence.assignLookup(lookup);
        sentence.root.attachTable(lookup);
        sentence.run();
      })
  )
);
