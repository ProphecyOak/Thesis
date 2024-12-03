import nltk
from gram import gramString
gram = nltk.CFG.fromstring(gramString)
parser = nltk.ChartParser(gram)

def parseTree(sentence):
  trees = list(parser.parse(sentence.lower().split(" ")))
  if len(trees) == 0: return
  return trees[0]

def resolveExpr(tree):
  match tree.label():
    case "sum":
      if len(tree) == 1: return resolveExpr(tree[0])
      match tree[1]:
        case 'plus': return resolveExpr(tree[0]) + resolveExpr(tree[2])
        case 'minus': return resolveExpr(tree[0]) - resolveExpr(tree[2])
    case "term":
      if len(tree) == 1: return resolveExpr(tree[0])
      match tree[1]:
        case "times": return resolveExpr(tree[0]) * resolveExpr(tree[2])
    case "factor":
      if len(tree) == 1: return resolveExpr(tree[0])
      return resolveExpr(tree[1]) * -1
    case "digit":
      # TODO: Probably have to change this to not allow word-forms of numbers
      # since no easy way to tell what's a number
      # or pre-process to change all word forms to digits ahead of time
      # and then handle that
      match tree[0]:
        case "one": return 1
        case "two": return 2
        case "three": return 3
        case "four": return 4
        case "five": return 5
        case "six": return 6
        case "seven": return 7
        case "eight": return 8
        case "nine": return 9
        case "zero": return 0

def printResult(sentence):
  print(resolveExpr(parseTree(sentence)))

printResult("nine times nine times nine")