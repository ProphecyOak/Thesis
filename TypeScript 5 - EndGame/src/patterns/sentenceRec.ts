import { apply, combine, kleft, nil, rep_sc, str } from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, TokenKind } from "../header";
import { LexValue } from "../components/xValue";

pattern(
  parserRules.SENTENCE,
  combine(parserRules.WORD, (word: LexValue<any>) =>
    apply(
      kleft(rep_sc(parserRules.WORD), str(".")),
      (words: LexValue<any>[]) => {
        word.setRest(words);
        return word;
      }
    )
  )
);
