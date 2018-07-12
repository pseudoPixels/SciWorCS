


import subprocess
import os
#pipe = subprocess.Popen(["perl", "fastqc",  "-i",  "SP1.fq"]).communicate()
tmpDir = fastqc_summary+'_tmp'
pipe = subprocess.Popen(["/bin//mkdir", tmpDir]).communicate()
lines = ''
with open(fastq_file_path) as module_1_inp:
	lines = module_1_inp.readlines()

#only read the first line (in case it has multiples)
fastq_file_path = lines[0]
pipe2 = subprocess.Popen(["/usr/bin/perl", "/home/ubuntu/Webpage/fastqc_wrapper/FastQC/fastqc", fastq_file_path, "--outdir", tmpDir , "--extract"]).communicate()

tmpHTML = fastq_file_path.split('/')[len(fastq_file_path.split('/')) - 1]
fileName = ''
for i in range(len(tmpHTML.split('.')) - 1):
	fileName += str(tmpHTML.split('.')[i])
tmpHTML = fileName+'_fastqc.html'
tmpZIP = fileName+'_fastqc.zip'
os.rename(tmpDir+'/' + tmpHTML, fastqc_summary)
os.rename(tmpDir+'/' + tmpZIP, fastqc_compressed_report)
pipe3 = subprocess.Popen(["/bin//rm", "-r", tmpDir]).communicate()