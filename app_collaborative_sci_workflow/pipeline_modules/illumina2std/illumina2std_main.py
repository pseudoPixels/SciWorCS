

import subprocess

with open(outDir+"illumina2std.fq", "w") as f:
	subprocess.Popen(["/usr/bin/perl", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/fq_all2std.pl", "illumina2std", inputFile], stdout=f).communicate()


