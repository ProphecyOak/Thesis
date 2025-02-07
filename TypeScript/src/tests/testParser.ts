import * as assert from 'assert';
import { evaluate } from "../components/parser";

test(`Parser: calculator`, () => {
    assert.strictEqual(evaluate('1'), 1);
    assert.strictEqual(evaluate('+1.5'), 1.5);
    assert.strictEqual(evaluate('-0.5'), -0.5);
    assert.strictEqual(evaluate('1 + 2'), 3);
    assert.strictEqual(evaluate('1 - 2'), -1);
    assert.strictEqual(evaluate('1 * 2'), 2);
    assert.strictEqual(evaluate('1 / 2'), 0.5);
    assert.strictEqual(evaluate('1 + 2 * 3 + 4'), 11);
    assert.strictEqual(evaluate('(1 + 2) * (3 + 4)'), 21);
    assert.strictEqual(evaluate('1.2--3.4'), 4.6);
});