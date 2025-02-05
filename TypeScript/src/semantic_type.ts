class semantic_type {
	takes(other: semantic_type): boolean {return false}
	is(other: semantic_type): boolean {return false}
}

class compound_type implements semantic_type {
	input: compound_type;
	output: compound_type;

	constructor(input_: compound_type, output_: compound_type) {
		this.input = input_;
		this.output = output_;
	}
	takes(other: semantic_type): boolean {
		return this.input.is(other);
	}
	is(other: semantic_type): boolean {
		if (other instanceof basic_type) return false;
		return this.input.is((<compound_type>other).input) && this.output.is((<compound_type>other).output);
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
}