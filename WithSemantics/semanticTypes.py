class semanticType():
	def __init__(self):
		self.signature = {}
	def addFrame(self, input, output):
		self.signature[input] = output
	def takes(self, other):
		return other.signature in self.signature.keys()