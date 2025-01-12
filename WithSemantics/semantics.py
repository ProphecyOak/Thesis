from nltk.tree.tree import Tree
from lexicon.pos import POS
from semanticTypes import *

lexicon = POS.builtins

class Semantics():
    main = None
    def __init__(self):
        if Semantics.main != None:
            self = Semantics.main
            return
        Semantics.main = self

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
                match type(self.value): 
                    case int:
                        self.type = simpleType(1)
            case "verb_terminal":
                word = lexicon["VERB"][self.value]
                self.value = word.callback
                self.type = word.type
            case "binop_terminal":
                word = lexicon["BINOP"][self.value]
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