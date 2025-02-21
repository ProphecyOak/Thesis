import * as assert from "assert";
import { evaluate } from "../components/parser";

test(`Parser: calculator`, () => {
  var program = evaluate("Say 23.\nSay 45.");
  program.meaning();
});
