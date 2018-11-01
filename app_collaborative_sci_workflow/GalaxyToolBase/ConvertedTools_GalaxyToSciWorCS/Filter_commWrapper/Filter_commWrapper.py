
import subprocess
pipe = subprocess.Popen(["/usr/bin/perl", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/filters/commWrapper.pl", input1, input2, mode, out_file1]).communicate()