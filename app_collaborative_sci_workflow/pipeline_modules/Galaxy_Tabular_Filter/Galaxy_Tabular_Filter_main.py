

tmpJsonFile = filtered_tabular+'_tmp.json'
with open(tmpJsonFile, 'w') as f:
    f.write(filter_json.replace("'", '"'))

import subprocess

pipe = subprocess.Popen(["python", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/Imported/filter_tabular.py", "-i", tabular_input, "-j", tmpJsonFile, "-o", filtered_tabular]).communicate()

subprocess.Popen(["/bin//rm", tmpJsonFile]).communicate()