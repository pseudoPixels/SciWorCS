


import subprocess
import os
#pipe = subprocess.Popen(["perl", "fastqc",  "-i",  "SP1.fq"]).communicate()
tmpDir = forward_fastq+'_tmp'
pipe = subprocess.Popen(["/bin//mkdir", tmpDir]).communicate()


out, err = subprocess.Popen(["/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/Imported/pear-0.9.10-bin-64", "-f", forward_fastq , "-r", reverse_fastq, "-o", tmpDir+"/tmp"]).communicate()













#copy tmp.assembled.fastq to required ref
subprocess.Popen(['/bin/cp', tmpDir+'/tmp.assembled.fastq', assembled]).communicate()

#copy tmp.discarded.fastq to required ref
subprocess.Popen(['/bin/cp', tmpDir+'/tmp.discarded.fastq', discarded]).communicate()

#copy tmp.unassembled.forward.fastq to required ref
subprocess.Popen(['/bin/cp', tmpDir+'/tmp.unassembled.forward.fastq', forward_unassembled]).communicate()

#copy tmp.unassembled.reverse.fastq to required ref
subprocess.Popen(['/bin/cp', tmpDir+'/tmp.unassembled.reverse.fastq', reverse_unassembled]).communicate()


#finally remove the temp dir
pipe3 = subprocess.Popen(["/bin//rm", "-r", tmpDir]).communicate()

