from compiler import run_code

latestInput = ""

def getInput():
	global latestInput
	latestInput = input(">>> ")
	return latestInput

while getInput() != "*":
	run_code(latestInput, debug=False)