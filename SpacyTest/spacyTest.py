import spacy
from nltk import Tree
from spacy import displacy

nlp = spacy.load("en_core_web_sm")

doc = nlp("Say 'hello'.")

def to_nltk_tree(node):
    if node.n_lefts + node.n_rights > 0:
        return Tree(node.orth_, [to_nltk_tree(child) for child in node.children])
    else:
        return node.orth_


[to_nltk_tree(sent.root).pretty_print() for sent in doc.sents]