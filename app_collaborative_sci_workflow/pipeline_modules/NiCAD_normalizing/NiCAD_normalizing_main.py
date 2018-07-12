
import subprocess

pipe = subprocess.Popen(
    ["/bin/bash", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/External_Libraries/NiCad-4.0/scripts/Normalize",
     granularity, language,
     potential_clones, normalization,
     normalized_potential_clones]).communicate()

