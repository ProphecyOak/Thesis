import { alt, apply, combine, kleft, rep_sc, str } from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, TokenKind } from "../header";
import { LexValue, Value } from "../components/xValue";

pattern(
  parserRules.SENTENCE,
  combine(parserRules.WORD, (word: LexValue<any>) =>
    apply(
      rep_sc(alt(parserRules.WORD, parserRules.LITERAL)),
      (words: Value<any>[]) => {
        word.setRest(words);
        return word;
      }
    )
  )
);
