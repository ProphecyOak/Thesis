import { alt, apply, combine, kleft, rep_sc, str } from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, TokenKind } from "../header";
import { LexValue, MergeMode, MergeValue, Value } from "../components/xValue";

pattern(
  parserRules.SENTENCE,
  combine(parserRules.WORD, (verb: LexValue<any>) =>
    apply(
      rep_sc(alt(parserRules.WORD, parserRules.LITERAL)),
      (words: Value<any>[]) => {
        verb.setRest(
          words
            .map((value: Value<any>) => {
              return value.getSymbol();
            })
            .join(" ")
        );
        return verb;
      }
    )
  )
);
