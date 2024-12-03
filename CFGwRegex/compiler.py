from gram import gramString
from parser import parseProgram
from evaluator import Evaluator

with open("CFGwRegex/testProgram.txt", "r") as f:
	codeLines = parseProgram(f.read(), gramString)
	# for line in codeLines: print(line)
	myEvaluator = Evaluator(codeLines)
	myEvaluator.evaluateProgram()