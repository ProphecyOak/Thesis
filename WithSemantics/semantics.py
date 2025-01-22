from nltk.tree.tree import Tree
from lexicon.pos import POS
from semanticTypes import *

DEBUG = False

class Semantics():
    main = None
    state = None
    def __init__(self):
        if Semantics.main != None:
            self = Semantics.main
            return
        Semantics.main = self
        semanticState.setup()

    def resolve(self, AST):
        semanticTree = self.convert_to_tree(AST)
        semanticTree.get_types()
        semanticTree.get_values()
        return semanticTree.value
    
    def convert_to_tree(self, AST, parentNode=None):
        non_terminal = type(AST) == Tree
        if non_terminal:
            node = semanticNode(AST.label() if non_terminal else AST, parentNode)
            for child in AST: self.convert_to_tree(child, node)
            return node
        if AST == ".": return
        parentNode.set_value(AST)

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
        if DEBUG: semanticState.print_state(to_add)
    
    def lookup(pos, token, state=None):
        state_to_check = state if state != None else semanticState.current_state
        if pos in state_to_check.lookup_table.keys() and token in state_to_check.lookup_table[pos].keys(): return state_to_check.lookup_table[pos][token]
        if state_to_check.parent == None: return None
        return semanticState.lookup(pos, token, state_to_check.parent)
    
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

class semanticNode():
    def __init__(self, label, parent_=None):
        self.parent = parent_
        self.root = self.parent == None
        if not self.root: self.parent.children.append(self)
        self.children = []
        self.type = None
        self.name = label
        self.value = None
        self.function = None
        self.argument = None
    
    def set_value(self, value_):
        self.value = value_
    
    def get_values(self):
        if self.value != None: return self.value
        for child in self.children: child.get_values()
        if self.name == "paragraph":
            self.value = lambda: concatenateFunctions(self.children)
            return self.value
        if self.function != None:
            try:
                self.value = self.function.value(self.argument.value)
            except Exception as e:
                print("PROBLEM:")
                print(self)
                print(self.function)
                raise(e)
            return self.value
        self.value = self.children[0].value
        return self.value

    def __str__(self):
        return f"Name: {self.name}, Type: {str(self.type)}," + \
            f"Value: {str(self.value)}\nChildren: " + \
            ",".join([f"{child.name}" for child in self.children])+"\n"
    
    def get_types(self):
        if self.type != None: return self.type
        if self.name == "paragraph":
            for x in self.children: x.get_types()
            return semanticType(simpleType(-1), simpleType(-1))
        match len(self.children):
            case 0: # Terminal
                self.get_terminal_types()
            case 1: # Non-Branching
                self.type = self.children[0].get_types()
            case 2: # Branching
                self.get_branching_types()
        return self.type
    
    def get_terminal_types(self):
        match self.name:
            case "simpleType":
                match self.value: 
                    case int():
                        self.type = simpleType(1)
                    case str():
                        self.type = simpleType(2)
            case "verb_terminal":
                word = semanticState.lookup("VERB", self.value)
                self.value = word.callback
                self.type = word.type
            case "binop_terminal":
                word = semanticState.lookup("BINOP", self.value)
                self.value = word.callback
                self.type = word.type
    
    def get_branching_types(self):
        first = self.children[0].get_types()
        second = self.children[1].get_types()
        if first > second:
            self.function = self.children[1]
            self.argument = self.children[0]
        elif second > first:
            self.function = self.children[0]
            self.argument = self.children[1]
        else: print(f"Type Mismatch: Cannot compose {str(first)} with {str(second)}")
        self.type = self.function.get_types().result()
    
    def printTree(self, depth=0):
        print("|  "* depth + f"{self.name}: {str(self.type)}"+(f": {self.value}" if self.value != None else ""))
        for child in self.children: child.printTree(depth+1)
        if depth == 0: print()
    
def concatenateFunctions(nodes):
    for x in nodes: x.value()

class SemanticObject():
    def __init__(self):
        pass