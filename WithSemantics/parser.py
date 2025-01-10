import nltk
from word2number import w2n
from lexicon.verbs import built_ins as verbs

class Parser():
	def __init__(self, grammar):
		gram = nltk.CFG.fromstring(grammar)
		self.nltk_parser = nltk.ChartParser(gram)

	def parse(self, tokens):
		custom_terminals = []
		for i, token in enumerate(tokens):
			# Extricate Imperative Verbs
			if i == 0 and tokens[-1] == "." and token in verbs.keys():
				custom_terminals.append(token)
				tokens[i] = "VERB"
				continue

			# Extricate Number Literals
			try:
				value = w2n.word_to_num(token)
				custom_terminals.append(value)
				tokens[i] = "NUM"
			except: pass

		tree = list(self.nltk_parser.parse(tokens))[0]
		flattenParagraphs(tree)
		reinsertTerminals(tree, custom_terminals)
		return tree #AST
	
def flattenParagraphs(tree):
	if type(tree) != nltk.tree.Tree: return
	if tree.label() == "paragraph":
		while tree[-1].label() == "paragraph":
			tree.pop(-2)
			tree += tree.pop(-1)
	for child in tree: flattenParagraphs(child)

def reinsertTerminals(tree, terminals):
	if type(tree) != nltk.tree.Tree: return
	if tree.label() == "verb_terminal" and tree[0] == "VERB" or\
		tree.label() == "simpleType" and tree[0] == "NUM":
		tree[0] = terminals.pop(0)
	for child in tree: reinsertTerminals(child, terminals)