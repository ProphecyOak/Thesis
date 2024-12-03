gramString = """
sum -> sum 'plus' term | sum 'minus' term |term
term -> term 'times' factor | factor
factor -> 'negative' digit | digit
digit -> 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'zero'
"""

# TODO: Figure out how to handle variable options (e.g. random proper nouns or numbers).
# Could possibly be done by making own CFG parser that grabs stuff that matches certain reg-ex requirements

# OR maybe turn all numbers, proper nouns into same terminal that is recognized by CFG
# and then replace those symbols in order of appearance with their actual values after parsing