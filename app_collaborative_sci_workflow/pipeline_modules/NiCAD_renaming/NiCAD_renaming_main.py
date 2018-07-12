
import subprocess

pipe = subprocess.Popen(
    ["/bin/bash", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/External_Libraries/NiCad-4.0/scripts/Rename",
     granularity, language,
     potential_clones, renaming,
     renamed_potential_clones]).communicate()

