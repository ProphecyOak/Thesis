"use strict";
class semantic_type {
    takes(other) { return false; }
    is(other) { return false; }
}
class compound_type {
    constructor(input_, output_) {
        this.input = input_;
        this.output = output_;
    }
    takes(other) {
        return this.input.is(other);
    }
    is(other) {
        if (other instanceof basic_type)
            return false;
        return this.input.is(other.input) && this.output.is(other.output);
    }
}
class basic_type {
    constructor() {
    }
    takes(other) {
        return false;
    }
    is(other) {
        if (other instanceof compound_type)
            return false;
        return this == other;
    }
}
