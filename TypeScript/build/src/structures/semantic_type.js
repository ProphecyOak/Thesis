"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Basics = void 0;
class semantic_type {
    takes(other) { return false; }
    is(other) { return false; }
    toString() { return `Unimplemented for ${typeof this}`; }
}
class compound_type {
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
    takes(other) {
        return this.input.is(other);
    }
    is(other) {
        if (other instanceof basic_type)
            return false;
        return this.input.is(other.input) && this.output.is(other.output);
    }
    toString() {
        return `<${this.input},${this.output}>`;
    }
}
class basic_type {
    constructor(name) {
        this.typeName = name;
    }
    takes(other) {
        return false;
    }
    is(other) {
        if (other instanceof compound_type)
            return false;
        return this == other;
    }
    toString() {
        return `${this.typeName}`;
    }
}
var Basics = {
    VOID: new basic_type("void"),
    ANY: new basic_type("any"),
    NUM: new basic_type("number"),
    STRING: new basic_type("string"),
    BOOLEAN: new basic_type("boolean"),
};
exports.Basics = Basics;
