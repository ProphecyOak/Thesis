export { type Semantic_Type, BasicTypes, compose, Compound_Type };

type Semantic_Type = Compound_Type | BasicType;

class Compound_Type {
  simple: boolean = false;
  input: Semantic_Type;
  output: Semantic_Type;
  constructor(input: Semantic_Type, output: Semantic_Type) {
    this.input = input;
    this.output = output;
  }
  takes(other: Semantic_Type): boolean {
    return this.input === other || this.input === BasicTypes.ANY;
  }
  is(other: Semantic_Type): boolean {
    return (
      other === BasicTypes.ANY ||
      (other instanceof Compound_Type &&
        this.input.is(other.input) &&
        this.output.is(other.output))
    );
  }
}

class BasicType {
  simple: boolean = true;
  value: number;
  constructor(value: number) {
    this.value = value;
  }
  takes(_other: Semantic_Type): boolean {
    return false;
  }
  is(other: Semantic_Type): boolean {
    return (
      other instanceof BasicType &&
      (this === BasicTypes.ANY ||
        other === BasicTypes.ANY ||
        this.value == other.value)
    );
  }
}

function compose(first: Semantic_Type, second: Semantic_Type) {
  return new Compound_Type(first, second);
}

enum basicValues {
  VOID,
  ANY,
  NUMBER,
  STRING,
  BOOLEAN,
}

var BasicTypes = {
  VOID: new BasicType(basicValues.VOID),
  ANY: new BasicType(basicValues.ANY),
  NUM: new BasicType(basicValues.NUMBER),
  STRING: new BasicType(basicValues.STRING),
  BOOLEAN: new BasicType(basicValues.BOOLEAN),
};
