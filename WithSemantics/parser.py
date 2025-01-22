import nltk
from nltk.tree import Tree
from word2number import w2n
from lexicon.lexicon import lexicon
from lexicon.pos import BINOP

class Parser():
	def __init__(self, grammar):
		gram = nltk.CFG.fromstring(grammar)
		self.nltk_parser = nltk.ChartParser(gram)

	def parse(self, tokens):
		custom_terminals = []
		for i, token in enumerate(tokens):
			# Extricate Imperative Verbs
			if i == 0 and tokens[-1] == "." and token.lower() in lexicon["VERB"].keys():
				custom_terminals.append(token.lower())
				tokens[i] = "VERB"
				continue

			# Extricate Objects (Proper Nouns)
			if token.lower() != token:
				custom_terminals.append(token)
				tokens[i] = "VAR"
				continue

			# Extricate Binary Operators
			if tokens[i] in lexicon["BINOP"].keys():
				custom_terminals.append(token)
				tokens[i] = "BINOP"
				continue

			# Extricate Number Literals
			try:
				value = w2n.word_to_num(token)
				custom_terminals.append(value)
				tokens[i] = "NUM"
			except: pass

		tree = list(self.nltk_parser.parse(tokens))[0]
		flatten_paragraphs(tree)
		reinsert_terminals(tree, custom_terminals)
		fix_order_of_ops(tree)
		return tree #AST

def fix_order_of_ops(tree):
	# ROTATE CERTAIN NODES TO MAINTAIN ORDER OF OPERATIONS
	for i, child in enumerate(tree):
		if type(child) != Tree: continue
		if child.label() == "expression": rotate_bin_ops(tree, i)
		else: fix_order_of_ops(child)
	return tree

def rotate_bin_ops(first_return, ind):
	returns = [first_return]
	node_queue = [first_return[ind]]
	firstID = id(first_return)
	while len(node_queue) > 0:
		current_node = node_queue.pop(0)
		for child in current_node:
			if type(child) == Tree: node_queue.append(child)

		if current_node.label() != "expression" or len(current_node) != 2 or current_node[0].label() != "binop_terminal": continue

		current_priority = BINOP.priority[current_node[0][0]]
		returns_latest = len(returns) - 1
		if returns_latest < current_priority:
			for x in range(current_priority - returns_latest): returns.append(current_node[1])
		elif returns_latest == current_priority: returns[-1] = current_node[1]
		elif returns_latest > current_priority:
			mid_section = returns[current_priority][-1]
			returns[current_priority][-1] = Tree("expression", [mid_section, current_node])
			remove_from_section(current_node, mid_section)

def remove_from_section(node, tree):
	if type(tree) != Tree: return
	if node in tree:
		tree.remove(node)
		return
	for child in tree: remove_from_section(node, child)
	
def flatten_paragraphs(tree):
	if type(tree) != Tree: return
	if tree.label() == "paragraph":
		while tree[-1].label() == "paragraph":
			tree.pop(-2)
			tree += tree.pop(-1)
	for child in tree: flatten_paragraphs(child)

def reinsert_terminals(tree, terminals):
	if type(tree) != Tree: return
	if tree.label() == "verb_terminal" and tree[0] == "VERB" or\
		tree.label() == "simpleType" and tree[0] == "NUM" or\
		tree.label() == "simpleType" and tree[0] == "VAR" or\
		tree.label() == "binop_terminal" and tree[0] == "BINOP":
		tree[0] = terminals.pop(0)
	for child in tree: reinsert_terminals(child, terminals)