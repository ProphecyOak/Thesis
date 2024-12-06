from scanner import Scanner
from parser import Parser
from semantics import Semantics
import time

class Compiler():
    comp = None
    def __init__(self):
        self.scanner = Scanner()
        self.parser = Parser()
        self.semantics = Semantics()
    
    def getCompiler():
        if Compiler.comp == None: Compiler.comp = Compiler()
        return Compiler.comp
    
    def compile(self, code):
        print("Compiling the code...")
        start_time = time.time()
        tokens = self.scanner.scan(code)
        ast = self.parser.parse(tokens)
        meaning  = self.semantics.resolve(ast)
        print(f"Done compiling in {round(time.time() - start_time,3)}s")
        return meaning

def run_code(code):
    myCompiler = Compiler.getCompiler()
    to_run = myCompiler.compile(code)
    result = to_run()
    if result != None: print(f"Result: {result}")

if __name__ == "__main__":
    code = ""
    run_code(code)