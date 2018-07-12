



import subprocess

with open(outDir+"std2sol.fq", "w") as f:
	subprocess.Popen(["/usr/bin/perl", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/fq_all2std.pl", "std2sol", inputFile], stdout=f).communicate()


