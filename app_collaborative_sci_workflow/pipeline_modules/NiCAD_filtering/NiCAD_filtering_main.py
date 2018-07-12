
import subprocess

pipe = subprocess.Popen(
    ["/bin/bash", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/External_Libraries/NiCad-4.0/scripts/Filter",
     granularity, language,
     potential_clones, filters,
     filtered_potential_clones]).communicate()

