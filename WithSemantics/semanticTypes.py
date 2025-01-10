class semanticType():
	def __init__(self, inType, outType=None):
		if outType == None:
			self.type = inType
		else:
			self.type = (inType.type, outType.type)
	
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
		return semanticType.equals(self.type, other.type[0])
	def __lt__(self, other): # Takes
		return semanticType.equals(self.type[0], other.type)
	
	def strRecurse(bit):
		if type(bit) == int: return ["*","int","str","obj","void"][bit]
		if len(bit) == 1: return semanticType.strRecurse(bit[0])
		return f"<{semanticType.strRecurse(bit[0])}, {semanticType.strRecurse(bit[1])}>"
	
	def __str__(self):
		return semanticType.strRecurse(self.type)

class simpleType(semanticType):
	def __init__(self, valueType):
		self.type = (valueType,)

####
# -1 - void
#  0 - any simple
#  1 - number
#  2 - string
#  3 - object