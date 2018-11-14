


import subprocess
import os
#pipe = subprocess.Popen(["perl", "fastqc",  "-i",  "SP1.fq"]).communicate()
tmpDir = extendedFrags+'_tmp'
pipe = subprocess.Popen(["/bin//mkdir", tmpDir]).communicate()


#Generates 5 outupts (3x.fq, .hist and .histogram)
subprocess.Popen(["/home/ubuntu/Webpage/bioinformatics/FLASH-1.2.11/flash", "--interleaved-input", fastq_file, "-d", tmpDir]).communicate()




#copy out.extendedFrags.fastq to required ref
subprocess.Popen(['/bin/cp', tmpDir+'/out.extendedFrags.fastq', extendedFrags]).communicate()

#copy out.hist to required ref
subprocess.Popen(['/bin/cp', tmpDir+'/out.hist', hist]).communicate()

#copy out.histogram to required ref
subprocess.Popen(['/bin/cp', tmpDir+'/out.histogram', histogram]).communicate()

#copy out.notCombined_1.fastq to required ref
subprocess.Popen(['/bin/cp', tmpDir+'/out.notCombined_1.fastq', notCombined_1]).communicate()

#copy out.notCombined_2.fastq to required ref
subprocess.Popen(['/bin/cp', tmpDir+'/out.notCombined_2.fastq', notCombined_2]).communicate()


#finally remove the temp dir
pipe3 = subprocess.Popen(["/bin//rm", "-r", tmpDir]).communicate()

