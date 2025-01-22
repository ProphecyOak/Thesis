from lexicon.pos import *

lexicon = POS.builtins

TYPES = {
	"void":simpleType(-1),
	"any":simpleType(0),
	"number":simpleType(1),
	"string":simpleType(2),
	"context":simpleType(3),
	"object":simpleType(4)
	}

## VERBS ##
VERB("identity", identityType(), lambda x: x)
VERB("say",
	semanticType(TYPES["any"],semanticType(TYPES["void"],TYPES["void"])),
	lambda x: lambda: print(x))
VERB("is",
	semanticType(TYPES["any"],semanticType(TYPES["any"],semanticType(TYPES["void"],TYPES["void"]))),
	lambda x: lambda y: lambda: print(x==y))
VERB("store",
	semanticType(TYPES["object"],semanticType(TYPES["void"],TYPES["void"])),
	lambda x: lambda: print(x))

## BINOPS ##
BINOP("plus",
	semanticType(TYPES["number"],semanticType(TYPES["number"],TYPES["number"])),
	lambda x: lambda y: x+y
	).set_priority(0)
BINOP("times",
	semanticType(TYPES["number"],semanticType(TYPES["number"],TYPES["number"])),
	lambda x: lambda y: x*y
	).set_priority(1)
