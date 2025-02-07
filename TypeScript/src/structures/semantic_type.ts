export {type semantic_type, Basics}

class semantic_type {
	takes(other: semantic_type): boolean {return false}
	is(other: semantic_type): boolean {return false}
	toString(): string {return `Unimplemented for ${typeof this}`}
}

class compound_type implements semantic_type {
	input: compound_type;
	output: compound_type;

	constructor(input: compound_type, output: compound_type) {
		this.input = input;
		this.output = output;
	}
	takes(other: semantic_type): boolean {
		return this.input.is(other);
	}
	is(other: semantic_type): boolean {
		if (other instanceof basic_type) return false;
		return this.input.is((<compound_type>other).input) && this.output.is((<compound_type>other).output);
	}
	toString(): string {
		return `<${this.input},${this.output}>`
	}
}

class basic_type implements semantic_type {
	typeName: string;

	constructor(name: string) {
		this.typeName = name;
	}

	takes(other: semantic_type): boolean {
		return false;
	}
	is(other: semantic_type): boolean {
		if (other instanceof compound_type) return false;
		return this == other;
	}
	toString(): string {
		return `${this.typeName}`
	}
}

var Basics = {
	VOID: new basic_type("void"),
	ANY: new basic_type("any"),
	NUM: new basic_type("number"),
	STRING: new basic_type("string"),
	BOOLEAN: new basic_type("boolean"),
}