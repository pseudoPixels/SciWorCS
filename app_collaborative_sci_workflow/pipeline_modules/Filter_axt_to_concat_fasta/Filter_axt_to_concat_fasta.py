
import subprocess
pipe = subprocess.Popen([python, "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/filters/axt_to_concat_fasta.py", dbkey_1, dbkey_2, "<", axt_input, ">", out_file1]).communicate()