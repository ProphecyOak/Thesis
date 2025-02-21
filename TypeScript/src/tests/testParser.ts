import * as assert from "assert";
import { evaluate } from "../components/parser";

test(`Parser: calculator`, () => {
  var program = evaluate("say 23.");
  program.meaning();
});
