
import subprocess
pipe = subprocess.Popen([python, "filters/axt_to_concat_fasta.py", dbkey_1, dbkey_2, "<", axt_input, ">", out_file1]).communicate()