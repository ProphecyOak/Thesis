from builtIns import functions
import nltk
import operator

class Evaluator():
    def __init__(self, prgm):
        self.prgm = prgm
        self.scope = Scope()

    def evaluateProgram(self):
        currentIndentation = 0
        for line in self.prgm:
            if line.indentation > currentIndentation:
                self.scope = self.scope.makeChildScope()
            elif line.indentation < currentIndentation:
                self.scope = self.scope.parentScope
            currentIndentation = line.indentation
            self.evaluateLine(line)

    def evaluateLine(self, line):
        self.recurseTree(line.tree)
        line.draw()
    
    def recurseTree(self, tree):
        if type(tree) != nltk.tree.tree.Tree: return tree
        match tree.label():
            case "declarative":
                return functions[tree[0]](self.recurseTree(tree[1]))
            case "sum":
                if len(tree) == 1: return self.recurseTree(tree[0])
                opToUse = operator.__add__ if tree[1] == "plus" else operator.__sub__
                return opToUse(self.recurseTree(tree[0]), self.recurseTree(tree[2]))
            case "term":
                if len(tree) == 1: return self.recurseTree(tree[0])
                opToUse = operator.__mul__ if tree[1] == "times" else operator.__truediv__
                return opToUse(self.recurseTree(tree[0]), self.recurseTree(tree[-1]))
            case _:
                return self.recurseTree(tree[0])

class Scope():
    def __init__(self, parent=None):
        self.parentScope = parent
        if self.parentScope == None: self.nestLevel = 0
        else: self.nestLevel = self.parentScope.nestLevel + 1
        self.variables = {}
        self.activeThetas = {}
    
    def makeChildScope(self):
        return Scope(self)
    
    def createVariable(self, variableName, value):
        self.variables[variableName] = value

    def addTheta(self, thetaName, callback):
        self.activeThetas[thetaName] = callback
    
    def provideTheta(self, thetaName, value):
        if thetaName in self.activeThetas.keys():
            self.activeThetas[thetaName](value)
            del self.activeThetas[thetaName]
    
    def getValue(self, variableName):
        if variableName in self.variables.keys():
            return self.variables[variableName]
        elif self.parentScope != None:
            return self.parentScope.getValue(variableName)
        else:
            self.createVariable(variableName)
            return self.getValue(variableName)
    
    def exit(self):
        if len(self.activeThetas.keys()) > 0:
            raise "Missing theta-role"
        return self.parentScope