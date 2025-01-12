from lexicon.pos import *

lexicon = POS.builtins

## VERBS ##
VERB("identity", identityType(), lambda x: x)
VERB("say",
	semanticType(simpleType(0),semanticType(simpleType(-1),simpleType(-1))),
	lambda x: lambda: print(x))

## BINOPS ##
BINOP("plus",
	semanticType(simpleType(1),semanticType(simpleType(1),simpleType(1))),
	lambda x: lambda y: x+y
	).set_priority(0)
BINOP("times",
	semanticType(simpleType(1),semanticType(simpleType(1),simpleType(1))),
	lambda x: lambda y: x*y
	).set_priority(1)