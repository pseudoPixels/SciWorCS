
import subprocess
pipe = subprocess.Popen(["/usr/bin/perl", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/filters/fixedValueColumn.pl", input, out_file1, exp, iterate]).communicate()