from semanticTypes import *

class POS():
	builtins = {
		"VERB":{},
		"BINOP":{},
		}
	def __init__(self, name_, type_, callback_=lambda: None):
		self.name = name_
		self.type = type_
		self.callback = callback_

class VERB(POS):
	def __init__(self, *args):
		super().__init__(*args)
		super().builtins["VERB"][self.name] = self

	def __str__(self):
		return f"Verb ({self.name})"

class BINOP(POS):
	priority = {}
	def __init__(self, *args):
		super().__init__(*args)
		super().builtins["BINOP"][self.name] = self

	def set_priority(self, priority_):
		self.priority = priority_
		BINOP.priority[self.name] = self.priority

	def __str__(self):
		return f"BinOp ({self.name})"
