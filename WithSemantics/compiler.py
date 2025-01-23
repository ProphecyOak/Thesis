from scanner import Scanner
from parser import Parser
from semantics import Semantics
import time

class Compiler():
	comp = None
	def __init__(self):
		self.scanner = Scanner()
		with open("natLang.gram") as g:
			self.parser = Parser(g.read())
		self.semantics = Semantics()
	
	def getCompiler():
		if Compiler.comp == None: Compiler.comp = Compiler()
		return Compiler.comp
	
	def compile(self, code, debug=False):
		if debug: print("[Compiling the code...]")
		start_time = time.time()
		# print(code)
		tokens = self.scanner.scan(code)
		# print(tokens)
		ast = self.parser.parse(tokens)
		# print(ast)
		meaning  = self.semantics.resolve(ast)
		if debug: print(f"[Done compiling in {round(time.time() - start_time,3)}s]")
		return meaning

def run_code(code, debug=True):
	myCompiler = Compiler.getCompiler()
	to_run = myCompiler.compile(code.split("\n"), debug)
	if debug: print("[Running code...]")
	result = to_run()
	if debug: print("[Code complete.]")
	if result != None: print(f"Result: {result}")

if __name__ == "__main__":
	code = "say forty-six."
	run_code(code)