
import subprocess
pipe = subprocess.Popen(["/usr/bin/perl", "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/filters/CreateInterval.pl", chrom, start, end, name, strand, out_file1]).communicate()