gramString = """
sentence -> "\t" sentence | declarative "."
declarative -> VP
VP -> Vbar
Vbar -> Vbar DP | PP Vbar | Vbar PP | V
V -> "verb"
DP -> DP PP | value
PP -> P DP
P -> "as"
value -> "num" | "var"
"""