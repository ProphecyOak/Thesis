from semanticTypes import *

built_ins = {}

class verb():
	def __init__(self, name_, type_, callback_=lambda: None):
		self.name = name_
		built_ins[self.name] = self
		self.type = type_
		self.callback = callback_
	def __str__(self):
		return f"Verb ({self.name})"

verb("identity", semanticType(simpleType(0),simpleType(0)), lambda x: x)
verb("say", semanticType(simpleType(0),simpleType(-1)), lambda x: print(x))