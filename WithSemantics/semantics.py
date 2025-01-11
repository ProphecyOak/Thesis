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
        semanticTree = self.convertToTree(AST)
        semanticTree.getTypes()
        semanticTree.getValues()
        return semanticTree.value
    
    def convertToTree(self, AST, parentNode=None):
        nonTerminal = type(AST) == Tree
        if nonTerminal:
            node = semanticNode(AST.label() if nonTerminal else AST, parentNode)
            for child in AST: self.convertToTree(child, node)
            return node
        if AST == ".": return
        parentNode.setValue(AST)

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
    
    def setValue(self, value_):
        self.value = value_
    
    def getValues(self):
        if self.value != None: return self.value
        for child in self.children: child.getValues()
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
    
    def getTypes(self):
        if self.type != None: return self.type
        match len(self.children):
            case 0: # Terminal
                self.getTerminalTypes()
            case 1: # Non-Branching
                self.type = self.children[0].getTypes()
            case 2: # Branching
                self.getBranchingTypes()
        return self.type
    
    def getTerminalTypes(self):
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
    
    def getBranchingTypes(self):
        first = self.children[0].getTypes()
        second = self.children[1].getTypes()
        if first > second:
            self.function = self.children[1]
            self.argument = self.children[0]
        elif second > first:
            self.function = self.children[0]
            self.argument = self.children[1]
        else: print(f"Type Mismatch: Cannot compose {str(first)} with {str(second)}")
        self.type = self.function.getTypes().result()
    
    def printTree(self, depth=0):
        print("|  "* depth + f"{self.name}: {str(self.type)}"+(f": {self.value}" if self.value != None else ""))
        for child in self.children: child.printTree(depth+1)
        if depth == 0: print()