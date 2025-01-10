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
		expected = ["say", "two", "plus", "three", ".", "NEWLINE",
					"INDENT", "Is", "John", "'s", "age", "fourty-five", "?", "NEWLINE",
					"DEDENT", "store", "60.45", "as", "Bob", ".", "NEWLINE"]
		result = Scanner().scan(code.split("\n"))
		self.assertEqual(result, expected)


with open("WithSemantics/natLang.gram") as g:
	testParser = Parser(g.readlines())

class TestParser(unittest.TestCase):
	def test_say_statement(self):
		tokens = ["say", "23", "."]
		expected = Tree("prgm",
						[Tree("paragraph",
							[Tree("sentence",[
								Tree("simple_sentence",[
									Tree("imperative",[
										Tree("verb_phrase",[
											Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
											Tree("object",[23])
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
		ast = Tree("prgm",
						[Tree("paragraph",
							[Tree("sentence",[
								Tree("simple_sentence",[
									Tree("imperative",[
										Tree("verb_phrase",[
											Tree("verb_phrase",[Tree("verb_terminal", ["say"])]),
											Tree("object",[23])
										]),
										"."
									])
								])
							])]
						)]
					)
		expected = ["23"]
		# print(ast)
		code = Semantics().resolve(ast)
		with Capturing() as output:
			result = code()
		self.assertEqual(output, expected)

if __name__ == '__main__':
	unittest.main()