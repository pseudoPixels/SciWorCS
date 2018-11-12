
import subprocess
pipe = subprocess.Popen([python, "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/filters/uniq.py", -i, input, -o, out_file1, -c, column, -d, delim, -s, sorting]).communicate()