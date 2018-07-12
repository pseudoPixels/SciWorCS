
import math

#temp variable for the two nums
num1 = 0


lines = ''
with open(base_number) as module_1_inp:
	lines = module_1_inp.readlines()

#only read the first line (in case it has multiples)
num1 = float(lines[0])



#calculation
res = num1 ** powr


#write out this module Output
with open(result, "w+") as thisModuleOutput:
	thisModuleOutput.write(str(res))