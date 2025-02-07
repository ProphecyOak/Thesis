"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tree_node = void 0;
const semantic_state_1 = require("./semantic_state");
class tree_node {
    constructor(node_label, value_type, value, parent) {
        this.node_label = node_label;
        this.value_type = value_type;
        this.value = value;
        this.children = new Array();
        this.state = new semantic_state_1.semantic_state(null);
        this.parent = parent;
    }
    add_child(node_label, value_type, value) {
        var new_node = new tree_node(node_label, value_type, value, this);
        this.children.push(new_node);
        return new_node;
    }
    print_tree(showValues = false, indent = 0) {
        var indent_space = "  ".repeat(indent);
        console.log(`${indent_space}${this.node_label}` + (showValues ? `-- Value: ${this.value}, Type: ${this.value_type.toString()}` : ``));
        this.children.forEach((child) => {
            child.print_tree(showValues, indent + 1);
        });
    }
}
exports.tree_node = tree_node;
