from enum import Enum

class ThetaRole(Enum):
    THEME = 0
    ALIAS = 1

class verb():
    def __init__(self, callback, *roles):
        self.callback = callback
        self.requiredRoles = list(roles)
        self.args = []
        self.value = None
        self.resolved = False
    
    def submitThetaRole(self, x):
        if x.value not in self.requiredRoles: return False
        self.args.append(x)
        self.requiredRoles.remove(x)
        self.resolve()
        return True
    
    def resolve(self):
        if len(self.requiredRoles) > 0: return
        self.value = self.callback(**self.args)
        self.resolved = True

verbs = {
    "say": verb(
        lambda x: print(x),
        ThetaRole.THEME
        ),
    "store": verb(
        lambda x, y: print(f"Store {x} under the name {y}"),
        ThetaRole.THEME, ThetaRole.ALIAS
        ),
}

class preposition():
    def __init__(self, callback):
        self.callback = callback
        self.arg = None
        self.value = None
        self.resolved = False
    
    def supplyDP(self, x):
        self.arg = x
        self.resolve()

    def resolve(self):
        if self.arg == None: return
        self.value = self.callback(self.arg)
        self.resolved = True

prepositions = {
    "as": preposition(
        lambda x: {"role": ThetaRole.ALIAS,"value": x}
    )
}