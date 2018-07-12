

#temp variable for the two nums
num1 = 0
num2 = 0

lines = ''
with open(module_1) as module_1_inp:
	lines = module_1_inp.readlines()

#only read the first line (in case it has multiples)
num1 = float(lines[0])

lines = ''
with open(module_2) as module_2_inp:
	lines = module_2_inp.readlines()

#only read the first line (in case it has multiples)
num2 = float(lines[0])

#calculation
res = num1 + num2


#write out this module Output
with open(output_destination+".txt", "w+") as thisModuleOutput:
	thisModuleOutput.write(str(res))