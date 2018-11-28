
import subprocess

pipe = subprocess.Popen(
    ["/bin/bash", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/External_Libraries/NiCad-4.0/scripts/Normalize",
     granularity, language,
     input_sourceCode, normalization,
     normalized_sourceCode]).communicate()

