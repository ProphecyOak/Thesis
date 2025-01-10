built_ins = {}

class verb():
	def __init__(self, _name):
		self.name = _name
		built_ins[self.name] = self
		self.frames = {}

	def addFrame(self, argument, callback):
		self.frames[argument] = callback

verb("say").addFrame("object", lambda x: print(x))