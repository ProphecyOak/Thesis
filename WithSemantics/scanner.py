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
            if line_imperative: line = line[0].lower() + line[1:]
            
            # Handle actual words
            for token in re.findall(r"'s|[0-9][,0-9]*(?:\.[0-9]+)?|[\w-]+|[.,!?;'\"]", line):
                self.tokens.append(token)

            # Handle Newline at end of each line
            self.tokens.append("NEWLINE")
        return self.tokens