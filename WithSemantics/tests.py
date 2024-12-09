from scanner import Scanner
from parser import Parser
import unittest
from nltk.tree import Tree

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
		code = ["say", "23", "."]
		expected = Tree("prgm",
						[Tree("paragraph",
							[Tree("sentence",[
								Tree("simple_sentence",[
									Tree("declarative",[
										Tree("verb_phrase",[
											Tree("verb_phrase",["say"]),
											Tree("object",[23])
										]),
										"."
									])
								])
							])]
						)]
					)
		result = testParser.parse(code)
		self.assertEqual(result, expected)

if __name__ == '__main__':
	unittest.main()