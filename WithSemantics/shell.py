from compiler import run_code

latestInput = ""

def getInput():
	global latestInput
	latestInput = input(">>> ")
	return latestInput

def red(text):
	return f"\033[31m{text}\033[0m"
def bold(text):
	return f"\033[01m{text}\033[0m"
def underline(text):
	return f"\033[04m{text}\033[0m"

def errorMessage(errorType, errorMessage):
	return f"{red(underline(bold((errorType))))} {red(errorMessage)}"

while getInput() != "*":
	# try:
		run_code(latestInput, debug=False)
	# except ValueError as e:
	# 	print(errorMessage("Invalid or Unsupported Command:", e))
	