import re
from word2number import w2n
import nltk

class CodeLine():
	def __init__(self, line, parser):
		self.line = line
		self.verbs = []
		self.numLiterals = []
		self.variableNames = []
		self.indentation = 0
		self.process(parser)
	
	def process(self, parser):
		self.tokenize()
		self.tree = list(parser.parse(self.tokens))[0]
		self.insertWildCards(self.tree)
		self.updateTokens()

	# Split the line into tokens
	def tokenize(self):
		self.tokens = re.findall(r"'s|[0-9][,0-9]*(?:\.[0-9]+)?|\t|[\w-]+|[.,!?;'\"]", self.line)
		# Make first letter character lowercase
		for i, token in enumerate(self.line):
			if token == "\t":
				self.indentation += 1
				continue
			self.tokens[i] = self.tokens[i].lower()
			break
		self.tokens = self.tokens[self.indentation:]
		if self.tokens[0] == "please": self.tokens.remove("please")
		if self.tokens[-1] == ".":
			# First word is a verb if sentence is declarative
			self.verbs.append(self.tokens[0])
			self.tokens[0] = "verb"
		# Store variable names and number literals
		for i in range(len(self.tokens)):
			self.tokens[i] = self.tokens[i].replace(",","")
			token = self.tokens[i]
			if token[0].isupper():
				self.variableNames.append(token)
				self.tokens[i] = "var"
				continue
			try: numValue = w2n.word_to_num(token)
			except:
				try: numValue = float(token)
				except: continue
			self.tokens[i] = "num"
			self.numLiterals.append(numValue)
		print(self.tokens)
			
	def insertWildCards(self, tree):
		if type(tree) == nltk.tree.tree.Tree:
			for i, child in enumerate(tree):
				childResult = self.insertWildCards(child)
				if childResult != None: tree[i] = childResult
			return
		match tree:
			case "verb": return self.verbs.pop(0)
			case "var": return self.variableNames.pop(0)
			case "num": return self.numLiterals.pop(0)
	
	def updateTokens(self):
		self.tokens = self.tree.leaves()
	
	def __str__(self):
		return f"Line: {self.line}\nTokens: {self.tokens}\nIndentation Level: {self.indentation}"
	def draw(self):
		self.tree.draw()

def parseProgram(prgm, grammar):
	gram = nltk.CFG.fromstring(grammar)
	parser = nltk.ChartParser(gram)
	codeLines = list([CodeLine(x, parser) for x in prgm.split("\n")])
	return codeLines