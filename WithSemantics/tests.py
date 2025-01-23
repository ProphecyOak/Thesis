from scanner import Scanner
from parser import Parser
from semantics import Semantics
import unittest
from nltk.tree import Tree
from io import StringIO 
import sys

class Capturing(list):
	# Implementation courtesy of:
	# https://stackoverflow.com/questions/16571150/how-to-capture-stdout-output-from-a-python-function-call
    def __enter__(self):
        self._stdout = sys.stdout
        sys.stdout = self._stringio = StringIO()
        return self
    def __exit__(self, *args):
        self.extend(self._stringio.getvalue().splitlines())
        del self._stringio    # free up some memory
        sys.stdout = self._stdout

class TestScanner(unittest.TestCase):
	def test_simple_sentence(self):
		code = "Say two plus three.\n\tIs John's age fourty-five?\nStore 60.45 as Bob."
		expected = ["Say", "two", "plus", "three", ".",
					"INDENT", "Is", "John", "'s", "age", "fourty-five", "?",
					"DEDENT", "Store", "60.45", "as", "Bob", "."]
		result = Scanner().scan(code.split("\n"))
		self.assertEqual(result, expected)
	
	def test_string_literal(self):
		code = "Say \"Hello World!\"."
		expected = ["Say", '"Hello World!"', "."]
		result = Scanner().scan(code.split("\n"))
		self.assertEqual(result, expected)


with open("natLang.gram") as g:
	testParser = Parser(g.readlines())

class TestParser(unittest.TestCase):
	def test_string_literal(self):
		tokens = ["Say", '"Hello World!"', "."]
		expected = Tree("prgm",
						[Tree("paragraph",
							[Tree("sentence",[
								Tree("simple_sentence",[
									Tree("imperative",[
										Tree("verb_phrase",[
											Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
											Tree("object",[Tree("expression",[Tree("simpleType",["Hello World!"])])])
										]),
										"."
									])
								])
							])]
						)]
					)
		result = testParser.parse(tokens)
		self.assertEqual(result, expected)

	def test_say_statement(self):
		tokens = ["say", "23", "."]
		expected = Tree("prgm",
						[Tree("paragraph",
							[Tree("sentence",[
								Tree("simple_sentence",[
									Tree("imperative",[
										Tree("verb_phrase",[
											Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
											Tree("object",[Tree("expression",[Tree("simpleType",[23])])])
										]),
										"."
									])
								])
							])]
						)]
					)
		result = testParser.parse(tokens)
		self.assertEqual(result, expected)

	def test_PEMDAS(self):
		tokens = ["say", "3", "times", "3", "plus", "4", "."]
		expected = Tree("prgm",
						[Tree("paragraph",
							[Tree("sentence",[
								Tree("simple_sentence",[
									Tree("imperative",[
										Tree("verb_phrase",[
											Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
											Tree("object",[
												Tree("expression",[
													Tree("expression",[
														Tree("simpleType",[3]),
														Tree("expression",[
															Tree("binop_terminal", ["times"]),
															Tree("expression",[Tree("simpleType",[3])])
														])
													]),
													Tree("expression",[
														Tree("binop_terminal", ["plus"]),
														Tree("expression",[Tree("simpleType",[4])])
													])
												])
											])
										]),
										"."
									])
								])
							])]
						)]
					)
		result = testParser.parse(tokens)
		self.assertEqual(result, expected)

	def test_proper_nouns(self):
		tokens = ["Say", "John", "."]
		expected = Tree("prgm",
						[Tree("paragraph",
							[Tree("sentence",[
								Tree("simple_sentence",[
									Tree("imperative",[
										Tree("verb_phrase",[
											Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
											Tree("object",[Tree("expression",[Tree("simpleType",["John"])])])
										]),
										"."
									])
								])
							])]
						)]
					)
		result = testParser.parse(tokens)
		self.assertEqual(result, expected)

class TestSemantics(unittest.TestCase):
	def test_say_statement(self):
		ast = Tree("prgm",[
				Tree("paragraph",
					[Tree("sentence",[
						Tree("simple_sentence",[
							Tree("imperative",[
								Tree("verb_phrase",[
									Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
									Tree("object",[Tree("expression",[Tree("simpleType",[23])])])
								]),
								"."
							])
						])
					])]
				)]
			)
		expected = ["23"]
		code = Semantics().resolve(ast)
		with Capturing() as output:
			code()
		self.assertEqual(output, expected)

	def test_plus_operator(self):
		ast = Tree("prgm",[
				Tree("paragraph",
					[Tree("sentence",[
						Tree("simple_sentence",[
							Tree("imperative",[
								Tree("verb_phrase",[
									Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
									Tree("object",[
										Tree("expression",[
											Tree("simpleType",[2]),
											Tree("expression",[
												Tree("binop_terminal", ["plus"]),
												Tree("expression",[Tree("simpleType",[2])])
											])
										])
									])
								]),
								"."
							])
						])
					])]
				)]
			)
		expected = ["4"]
		code = Semantics().resolve(ast)
		with Capturing() as output:
			code()
		self.assertEqual(output, expected)

	def test_sentences(self):
		ast = Tree("prgm", [
				Tree("paragraph", [
					Tree("sentence",[
						Tree("simple_sentence",[
							Tree("imperative",[
								Tree("verb_phrase",[
									Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
									Tree("object",[Tree("expression",[Tree("simpleType",[3])])])
								]),
								"."
							])
						])
					]),
					Tree("sentence",[
						Tree("simple_sentence",[
							Tree("imperative",[
								Tree("verb_phrase",[
									Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
									Tree("object",[Tree("expression",[Tree("simpleType",[3])])])
								]),
								"."
							])
						])
					]),
					Tree("sentence",[
						Tree("simple_sentence",[
							Tree("imperative",[
								Tree("verb_phrase",[
									Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
									Tree("object",[Tree("expression",[Tree("simpleType",[4])])])
								]),
								"."
							])
						])
					])
				])
			])
		expected = ["3","3","4"]
		code = Semantics().resolve(ast)
		with Capturing() as output:
			code()
		self.assertEqual(output, expected)

	def test_variables(self):
		ast = Tree("prgm", [
				Tree("paragraph", [
					Tree("sentence",[
						Tree("simple_sentence",[
							Tree("imperative",[
								Tree("verb_phrase",[
									Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
									Tree("object",[Tree("expression",[Tree("simpleType",[3])])])
								]),
								"."
							])
						])
					]),   ### REWRITE THIS TREE AND THE GRAMMAR TO ALLOW STORING AND READING
					Tree("sentence",[
						Tree("simple_sentence",[
							Tree("imperative",[
								Tree("verb_phrase",[
									Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
									Tree("object",[Tree("expression",[Tree("simpleType",[4])])])
								]),
								"."
							])
						])
					])
				])
			])
		expected = ["3"]
		code = Semantics().resolve(ast)
		with Capturing() as output:
			code()
		self.assertEqual(output, expected)

if __name__ == '__main__':
	unittest.main()