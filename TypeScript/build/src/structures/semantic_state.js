"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.semantic_state = void 0;
class semantic_state {
    constructor(parent_state) {
        this.parent_state = parent_state;
        this.lookup_table = new Map();
    }
    add(new_type, new_value) {
        var new_object = new semantic_object(new_type);
        new_object.set_value(new_value);
        return new_object;
    }
}
exports.semantic_state = semantic_state;
class semantic_object {
    constructor(object_type) {
        this.object_type = object_type;
    }
    set_value(new_value) {
        this.object_value = new_value;
    }
    get_value() {
        return this.object_value;
    }
    set_type(new_type) {
        this.object_type = new_type;
    }
    get_type() {
        return this.object_type;
    }
}
