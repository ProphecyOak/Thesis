from scanner import Scanner
import unittest

class TestScanner(unittest.TestCase):
	def test_simple_sentence(self):
		code = """
Say two plus three.
	Is John's age fourty-five?
Store 60.45 as Bob.
"""
		expected = ["say", "two", "plus", "three", ".", "NEWLINE",
					"INDENT", "Is", "John", "'s", "age", "fourty-five", "?", "NEWLINE",
					"DEDENT", "store", "60.45", "as", "Bob", ".", "NEWLINE"]
		result = Scanner().scan(code[1:-1].split("\n"))
		self.assertEqual(result, expected)

if __name__ == '__main__':
	unittest.main()