
import subprocess

pipe = subprocess.Popen(
    ["python", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/Imported/fasta_to_tabular.py",
     fasta_input, tabular_output,
     keep_first, descr_columns]).communicate()

