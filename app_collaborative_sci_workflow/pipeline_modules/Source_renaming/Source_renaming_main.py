
import subprocess

pipe = subprocess.Popen(
    ["/bin/bash", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/External_Libraries/NiCad-4.0/scripts/Rename",
     granularity, language,
     input_sourceCode, renaming,
     renamed_sourceCode]).communicate()

