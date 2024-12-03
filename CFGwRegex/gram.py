gramString = """
sentence -> "\t" sentence | declarative "."
declarative -> "verb" expr
expr -> sum
sum -> sum 'plus' term | sum 'minus' term |term
term -> term 'times' factor | term 'divided' 'by' factor | factor
factor -> 'negative' 'num' | 'num'
"""