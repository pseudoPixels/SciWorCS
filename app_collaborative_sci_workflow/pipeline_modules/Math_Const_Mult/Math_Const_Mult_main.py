

#temp variable for the two nums
num1 = 0


lines = ''
with open(input_number) as module_1_inp:
	lines = module_1_inp.readlines()

#only read the first line (in case it has multiples)
num1 = float(lines[0])



#calculation
res = num1 * const_num


#write out this module Output
with open(multiplication_result, "w+") as thisModuleOutput:
	thisModuleOutput.write(str(res))