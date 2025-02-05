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
VERB("set",
	semanticType(TYPES["object"],semanticType(TYPES["object"],TYPES["any"])),
	lambda name: lambda value: lambda: semanticState.current_state.set(name, value))

## BINOPS ##
BINOP("plus",
	semanticType(TYPES["number"],semanticType(TYPES["number"],TYPES["number"])),
	lambda x: lambda y: x+y
	).set_priority(0)
BINOP("times",
	semanticType(TYPES["number"],semanticType(TYPES["number"],TYPES["number"])),
	lambda x: lambda y: x*y
	).set_priority(1)

class semanticState():
    current_state = None
    def __init__(self):
        self.lookup_table = {}
        self.parent = semanticState.current_state
    
    def setup():
        semanticState.new_state()
        semanticState.add(POS.builtins)
    
    def add(to_add):
        for pos in to_add.keys():
            if pos not in semanticState.current_state.lookup_table.keys(): semanticState.current_state.lookup_table[pos] = {}
            semanticState.current_state.lookup_table[pos].update(to_add[pos])
    
    def lookup(pos, token, state=None):
        state_to_check = state if state != None else semanticState.current_state
        if pos in state_to_check.lookup_table.keys() and token in state_to_check.lookup_table[pos].keys(): return state_to_check.lookup_table[pos][token]
        if state_to_check.parent == None:
            if pos != "VARIABLE": return
            semanticState.current_state.set(token, None, TYPES["void"])
        return semanticState.lookup(pos, token, state_to_check.parent)

    def set(name, value, type_):
        semanticState.current_state.lookup_table["VARIABLE"][name] = stateObject(value, type_)
    
    def new_state():
        semanticState.current_state = semanticState()
    
    def exit_state():
        semanticState.current_state = semanticState.current_state.parent
    
    def print_state(state_to_print=None):
        if state_to_print == None: state_to_print = semanticState.current_state.lookup_table
        for pos, l in state_to_print.items():
            print(f"{pos}: ")
            for word, meaning in l.items():
                print("\t",meaning)

class stateObject():
    def __init__(self, callback_, type_):
        self.callback = callback_
        self.type = type_