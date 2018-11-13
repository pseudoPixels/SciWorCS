
import subprocess

pipe = subprocess.Popen(
    ["python", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/Imported/tabular_to_fasta.py",
     tabular_input, title_columns,
     seq_col, fasta_output]).communicate()

