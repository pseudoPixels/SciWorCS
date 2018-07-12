#!/bin/bash
set -e
# Generic NiCad extractor script
#
# Usage:  Extract granularity language system-directory select-pattern ignore-pattern
#           where granularity is one of:  { functions blocks ... }
#           and   language    is one of:  { c java cs py ... }
#           and   select-pattern is a grep pattern
#           and   ignore-pattern is a grep pattern

# Revised 3.12.15
echo 'Starting ls....' >> '/home/ubuntu/Webpage/app_collaborative_sci_workflow/workflow_outputs/test_workflow/mylog00.txt'
echo 'ls with echo'
echo ` ls ` >> '/home/ubuntu/Webpage/app_collaborative_sci_workflow/workflow_outputs/test_workflow/mylog00.txt'
echo 'Ending ls....' >> '/home/ubuntu/Webpage/app_collaborative_sci_workflow/workflow_outputs/test_workflow/mylog00.txt'
