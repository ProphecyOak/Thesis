// An enum for defining different base types and type-classes.
// TODO Make type-classes there own thing to make equality checks better.
enum SemanticPrimitive {
  Void = "Void",
  String = "String",
  Number = "Number",
  Boolean = "Boolean",
  Lexicon = "Lexicon",
  Stringable = "Stringable",
  Iterable = "Iterable",
}

// An interface for semantic types.
export interface SemanticType {
  // Returns true if this type is deeply-equivalent to the other.
  // Incoporates fuzziness for type classes.
  equals(other: SemanticType): boolean;

  // Returns true if this type's input is equal to the other type.
  takes(other: SemanticType): boolean;

  // Returns a stringified version of the type.
  toString(): string;

  // The specific type class.
  readonly typeKind: string;
}

// A semantic type with an input and an output.
export class CompoundSemanticType implements SemanticType {
  typeKind = "CompoundSemanticType";
  input: SemanticType;
  output: SemanticType;

  constructor(input: SemanticType, output: SemanticType) {
    this.input = input;
    this.output = output;
  }
  equals(other: SemanticType): boolean {
    return (
      other instanceof CompoundSemanticType &&
      this.input.equals(other.input) &&
      this.output.equals(other.output)
    );
  }
  takes(other: SemanticType): boolean {
    return this.input.equals(other);
  }
  toString(): string {
    return `<${this.input.toString()}, ${this.output.toString()}>`;
  }
}

// A semantic type that is not a function but just a primitive.
export class SimpleSemanticType implements SemanticType {
  typeKind = "SimpleSemanticType";
  type: SemanticPrimitive;
  constructor(type: SemanticPrimitive) {
    this.type = type;
  }
  equals(other: SemanticType): boolean {
    if (!(other instanceof SimpleSemanticType)) return false;
    if (this.type == SemanticPrimitive.Stringable)
      return [
        SemanticPrimitive.Boolean,
        SemanticPrimitive.Number,
        SemanticPrimitive.String,
        SemanticPrimitive.Stringable,
      ].includes(other.type);
    return other.type == this.type;
  }
  takes(): boolean {
    return false;
  }
  toString(): string {
    return this.type.toString();
  }
}

// A semantic type that contains properties and potentially methods eventually.
// Stores the property/method names along with the corresponding type for each.
export class ObjectSemanticType implements SemanticType {
  typeKind = "ObjectSemanticType";
  types = new Map<string, SemanticType>();
  constructor(valueType: SemanticType) {
    this.types.set("value", valueType);
  }

  equals(other: SemanticType): boolean {
    return other instanceof ObjectSemanticType;
  }
  takes(): boolean {
    return false;
  }
  toString(): string {
    return `{${Array.from(this.types.entries())
      .map(
        ([field, value]: [string, SemanticType]) =>
          `${field}: ${value.toString()}`
      )
      .join(", ")}}`;
  }
}

// A bunch of predefined simple types to avoid overly verbose type defining.
export const LexRoot = {
  Void: new SimpleSemanticType(SemanticPrimitive.Void),
  String: new SimpleSemanticType(SemanticPrimitive.String),
  Number: new SimpleSemanticType(SemanticPrimitive.Number),
  Boolean: new SimpleSemanticType(SemanticPrimitive.Boolean),
  Lexicon: new SimpleSemanticType(SemanticPrimitive.Lexicon),
  Stringable: new SimpleSemanticType(SemanticPrimitive.Stringable),
  Iterable: new SimpleSemanticType(SemanticPrimitive.Iterable),
  ValueObject: (valueType: SemanticType) => new ObjectSemanticType(valueType),
};
