built_ins = {}

class verb():
	def __init__(self, _name):
		self.name = _name
		built_ins[self.name] = self

verb("say")