"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
const typescript_parsec_1 = require("typescript-parsec");
const typescript_parsec_2 = require("typescript-parsec");
var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["Number"] = 0] = "Number";
    TokenKind[TokenKind["Add"] = 1] = "Add";
    TokenKind[TokenKind["Sub"] = 2] = "Sub";
    TokenKind[TokenKind["Mul"] = 3] = "Mul";
    TokenKind[TokenKind["Div"] = 4] = "Div";
    TokenKind[TokenKind["LParen"] = 5] = "LParen";
    TokenKind[TokenKind["RParen"] = 6] = "RParen";
    TokenKind[TokenKind["Space"] = 7] = "Space";
})(TokenKind || (TokenKind = {}));
const lexer = (0, typescript_parsec_1.buildLexer)([
    [true, /^\d+(\.\d+)?/g, TokenKind.Number],
    [true, /^\+/g, TokenKind.Add],
    [true, /^\-/g, TokenKind.Sub],
    [true, /^\*/g, TokenKind.Mul],
    [true, /^\//g, TokenKind.Div],
    [true, /^\(/g, TokenKind.LParen],
    [true, /^\)/g, TokenKind.RParen],
    [false, /^\s+/g, TokenKind.Space]
]);
function applyNumber(value) {
    return +value.text;
}
function applyUnary(value) {
    switch (value[0].text) {
        case '+': return +value[1];
        case '-': return -value[1];
        default: throw new Error(`Unknown unary operator: ${value[0].text}`);
    }
}
function applyBinary(first, second) {
    switch (second[0].text) {
        case '+': return first + second[1];
        case '-': return first - second[1];
        case '*': return first * second[1];
        case '/': return first / second[1];
        default: throw new Error(`Unknown binary operator: ${second[0].text}`);
    }
}
const TERM = (0, typescript_parsec_1.rule)();
const FACTOR = (0, typescript_parsec_1.rule)();
const EXP = (0, typescript_parsec_1.rule)();
/*
TERM
  = NUMBER
  = ('+' | '-') TERM
  = '(' EXP ')'
*/
TERM.setPattern((0, typescript_parsec_2.alt)((0, typescript_parsec_2.apply)((0, typescript_parsec_2.tok)(TokenKind.Number), applyNumber), (0, typescript_parsec_2.apply)((0, typescript_parsec_2.seq)((0, typescript_parsec_2.alt)((0, typescript_parsec_2.str)('+'), (0, typescript_parsec_2.str)('-')), TERM), applyUnary), (0, typescript_parsec_2.kmid)((0, typescript_parsec_2.str)('('), EXP, (0, typescript_parsec_2.str)(')'))));
/*
FACTOR
  = TERM
  = FACTOR ('*' | '/') TERM
*/
FACTOR.setPattern((0, typescript_parsec_2.lrec_sc)(TERM, (0, typescript_parsec_2.seq)((0, typescript_parsec_2.alt)((0, typescript_parsec_2.str)('*'), (0, typescript_parsec_2.str)('/')), TERM), applyBinary));
/*
EXP
  = FACTOR
  = EXP ('+' | '-') FACTOR
*/
EXP.setPattern((0, typescript_parsec_2.lrec_sc)(FACTOR, (0, typescript_parsec_2.seq)((0, typescript_parsec_2.alt)((0, typescript_parsec_2.str)('+'), (0, typescript_parsec_2.str)('-')), FACTOR), applyBinary));
function evaluate(expr) {
    return (0, typescript_parsec_1.expectSingleResult)((0, typescript_parsec_1.expectEOF)(EXP.parse(lexer.parse(expr))));
}
