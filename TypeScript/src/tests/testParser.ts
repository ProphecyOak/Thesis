import * as assert from 'assert';
import { evaluate } from "../components/parser";

test(`Parser: calculator`, () => {
    console.log(evaluate('"23"'));
});