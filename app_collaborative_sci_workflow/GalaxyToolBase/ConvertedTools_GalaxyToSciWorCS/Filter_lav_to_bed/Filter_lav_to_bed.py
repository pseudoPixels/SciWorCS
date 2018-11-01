
import subprocess
pipe = subprocess.Popen([python, "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/filters/lav_to_bed.py", lav_file, bed_file1, bed_file2]).communicate()