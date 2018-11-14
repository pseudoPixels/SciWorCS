



# import subprocess
#
# with open(outDir+"std2sol.fq", "w") as f:
# 	subprocess.Popen(["/usr/bin/perl", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/fq_all2std.pl", "std2sol", inputFile], stdout=f).communicate()


import subprocess
import os

# lines = ''
# with open(input_file_path) as module_1_inp:
# 	lines = module_1_inp.readlines()

#only read the first line (in case it has multiples)
#input_file_path = scarf_fastq_file

with open(seqPlusQual, "w") as f:
	subprocess.Popen(["/usr/bin/perl", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/fq_all2std.pl", "std2qual", std_fastq], stdout=f).communicate()


