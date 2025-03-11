import { apply, combine, kleft, nil, str } from "typescript-parsec";
import { pattern } from "../components/parser";
import { parserRules, VerbInterface } from "../header";
import { Verb } from "../components/verb";

pattern(
  parserRules.SENTENCE,
  kleft(
    combine(parserRules.VERB, (verb: VerbInterface) => {
      return verb.acceptArguments();
    }),
    str(".")
  )
);

pattern(
  parserRules.VERB,
  apply(parserRules.WORD, (word: string) => {
    return new Verb(word);
  })
);
