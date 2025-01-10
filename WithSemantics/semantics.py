from nltk.tree.tree import Tree
import lexicon.verbs as verbs

class Semantics():
    def __init__(self):
        self.tree = None

    def resolve(self, AST):
        self.tree = semanticNode(AST)
        return self.tree.resolve().meaning

class semanticNode():
    def __init__(self, AST, parent_=None):
        self.parent = parent_
        self.terminal = type(AST) != Tree
        self.type = self.parent.type if self.terminal else AST.label()
        self.name = AST if self.terminal else AST.label()
        self.children = [] if self.terminal else [semanticNode(child, self) for child in AST]
        self.resolved = False
        self.meaning = None
        self.takes = {}
        
    def resolve(self):
        if self.resolved: return self
        match len(self.children):
            case 0: # TERMINAL
                match self.type:
                    case "verb_terminal":   
                        if self.name not in verbs.built_ins:
                            print(f"ERROR: No verb '{self.name}'")
                            return ERROR
                        self.meaning = verbs.built_ins[self.name]
                        self.takes = self.meaning.frames
                    case "object":
                        self.meaning = self.name
            case 1: # NON-BRANCHING
                self.meaning = self.children[0].resolve().meaning
                self.takes = self.children[0].takes
            case 2: # BINARY
                for child in self.children: child.resolve()
                print(f"{self.children[0].type}, {self.children[1].type}")
                print(f"{self.children[0].takes}, {self.children[1].takes}")
                if self.children[1].type in self.children[0].takes.keys():
                    print("AHA")
                    self.meaning = self.children[0].takes[self.children[1].type](self.children[1].meaning)
                else:
                    print("BOO")
                    self.meaning = self.children[1].takes[self.children[0].type]
        self.resolved = True
        return self

ERROR = None