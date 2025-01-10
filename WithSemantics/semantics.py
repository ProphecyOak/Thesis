from nltk.tree.tree import Tree
import lexicon.verbs as verbs
from semanticTypes import *

class Semantics():
    def __init__(self):
        pass

    def resolve(self, AST):
        semanticTree = self.convertToTree(AST)
        semanticTree.getTypes()
        semanticTree.getValues()
        # semanticTree.printTree()
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
            self.value = lambda: self.function.value.callback(self.argument.value)
            return self.value
        self.value = self.children[0].value
        return self.value

    def __str__(self):
        return f"Name: {self.name}, Type: {str(self.type)}, Value: {str(self.value)}\nChildren: " + ", ".join([f"{child.name}" for child in self.children])+"\n"
    
    def getTypes(self):
        if self.type != None: return self.type
        match len(self.children):
            case 0:
                match self.name:
                    case "simpleType":
                        match type(self.value): 
                            case int:
                                self.type = simpleType(1)
                    case "verb_terminal":
                        self.value = verbs.built_ins[self.value]
                        self.type = self.value.type
            case 1:
                self.type = self.children[0].getTypes()
            case 2:
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
        return self.type
    
    def printTree(self, depth=0):
        print("|  "* depth + f"{self.name}: {str(self.type)}"+(f": {self.value}" if self.value != None else ""))
        for child in self.children: child.printTree(depth+1)
        if depth == 0: print()