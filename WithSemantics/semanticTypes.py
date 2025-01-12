class semanticType():
	def __init__(self, inType, outType=None, identity=False):
		self.type = inType if outType == None else (inType.type, outType.type)
		self.identity = identity
	
	def result(self):
		return semanticType(self.type[1])
	
	def simple(self):
		return len(self.type) == 1

	def equals(first, second):
		if type(first) != type(second): return False
		if type(first) == int: return first == second or first == 0 or second == 0
		if len(first) != len(second): return False
		for i in range(len(first)):
			if not semanticType.equals(first[i], second[i]): return False
		return True

	def __gt__(self, other): # Goes in to
		if other.identity: return True
		return semanticType.equals(self.type, other.type[0])
	def __lt__(self, other): # Takes
		if self.identity: return True
		return semanticType.equals(self.type[0], other.type)
	
	def str_recurse(bit):
		if type(bit) == int: return ["*","int","str","obj","void"][bit]
		if len(bit) == 1: return semanticType.str_recurse(bit[0])
		return f"<{semanticType.str_recurse(bit[0])}, {semanticType.str_recurse(bit[1])}>"
	
	def __str__(self):
		return semanticType.str_recurse(self.type)

class identityType(semanticType):
	def __init__(self):
		super().__init__(0,identity=True)

class simpleType(semanticType):
	def __init__(self, valueType):
		super().__init__((valueType,))

####
# -1 - void
#  0 - any simple
#  1 - number
#  2 - string
#  3 - context
#  4 - object