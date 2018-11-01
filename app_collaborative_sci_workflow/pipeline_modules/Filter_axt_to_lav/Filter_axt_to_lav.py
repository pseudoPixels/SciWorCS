
import subprocess
pipe = subprocess.Popen([python, "/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/filters/axt_to_lav.py", /galaxy/data/dbkey_1/seq/%s.nib:dbkey_1:GALAXY_DATA_INDEX_DIR/shared/ucsc/chrom/dbkey_1.len, /galaxy/data/dbkey_2/seq/%s.nib:dbkey_2:GALAXY_DATA_INDEX_DIR/shared/ucsc/chrom/dbkey_2.len, align_input, lav_file, seq_file1, seq_file2]).communicate()