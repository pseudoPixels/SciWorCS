
import subprocess
pipe = subprocess.Popen(["/usr/bin/perl", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/filters/cutWrapper.pl", input, columnList, delimiter, out_file1]).communicate()