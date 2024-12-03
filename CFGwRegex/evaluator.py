import nltk
import operator
from builtIns import verbs, prepositions

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
        if line.tree[0].label() == "declarative":
            verbToFill = verbs[line.tree.leaves()[0]]
            self.findArguments(verbToFill, line.tree[0][0])
        line.draw()
    
    def findArguments(self, verb, tree):
        if verb.resolved: return
        if type(tree[0]) != nltk.tree.tree.Tree:
            print(tree)
        else:
            for x in range(3):
                try: self.findArguments(verb, tree[x])
                except: break


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