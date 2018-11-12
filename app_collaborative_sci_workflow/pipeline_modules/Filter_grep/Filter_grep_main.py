
import subprocess
pipe = subprocess.Popen([python, "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/filters/grep.py", -i, input, -o, out_file1, -pattern, 'pattern', -v, invert]).communicate()