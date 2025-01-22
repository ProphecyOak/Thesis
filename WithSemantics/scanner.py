import re

class Scanner():
    def __init__(self):
        pass

    def scan(self, code_lines):
        self.tokens = []
        indents_seen = 0
        for line in code_lines:

            # Handle Indentation
            current_indents = line.count("\t")
            if current_indents != indents_seen:
                self.tokens.append("INDENT" if current_indents > indents_seen else "DEDENT")
                indents_seen = current_indents
            
            # Remove Handled Whitespace
            line = line.replace("\n", "").replace("\t","")

            # De-capitalize imperative verb
            line_imperative = line[-1] == "."
            
            # Handle actual words
            storingString = False
            stringTokens = []
            for token in re.findall(r"'s|[0-9][,0-9]*(?:\.[0-9]+)?|[\w-]+|[.,!?;'\"]", line):
                if token == '"':
                    if not storingString:
                        stringTokens = []
                    else:
                        self.tokens.append(" ".join(stringTokens))
                    storingString = not storingString
                if storingString:
                    stringTokens.append(token)
                    continue
                self.tokens.append(token)
                if self.tokens[-1].lower() == "please": self.tokens.pop(-1)

        return self.tokens