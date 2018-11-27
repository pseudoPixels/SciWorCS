
import subprocess


lines = ''
with open(source_directory) as module_1_inp:
	lines = module_1_inp.readlines()

#only read the first line (in case it has multiples)
source_directory = lines[0]


pipe = subprocess.Popen(
    ["/bin/bash", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/External_Libraries/NiCad-4.0/scripts/Extract",
     granularity, language,
     source_directory, select_pattern, ignore_pattern,
     potential_clones]).communicate()

