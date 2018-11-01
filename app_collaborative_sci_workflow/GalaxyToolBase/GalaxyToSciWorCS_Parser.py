from io import StringIO
import sys
import subprocess
import tempfile
import os
import uuid
import glob
import xml.etree.ElementTree as ET





###############################################################
###############################################################
###############################################################
class ParseToolCommand:

    def __init__(self, xmlRoot):
        self.xmlRoot = xmlRoot


    def getToolCommandAsList(self):
        # <command interpreter="perl">CreateInterval.pl $chrom $start $end "$name" $strand $out_file1</command>
        commandLine = self.xmlRoot.find("command")


        #['CreateInterval.pl', '$chrom', '$start', '$end', '"$name"', '$strand', '$out_file1']
        commandLineList = commandLine.text.split(" ")


        updatedCommandList = []
        for aCommand in commandLineList:
            withRemovedVarSign = aCommand.replace('$', '')  #$start    ---> start
            withRemovedVarSign = withRemovedVarSign.replace('"','') # '"name"'  ---> 'name'

            updatedCommandList.append(withRemovedVarSign)


        return updatedCommandList #['CreateInterval.pl', 'chrom', 'start', 'end', '"name"', 'strand', 'out_file1']




    def getToolInterpreter(self):
        commandLine = self.xmlRoot.find("command")
        interpreter = commandLine.attrib['interpreter']

        return str(interpreter)








###############################################################
###############################################################
###############################################################
class ParseToolInput:
    def __init__(self, xmlRoot):
        self.xmlRoot = xmlRoot

    def getToolDataInputDefinition(self):
        toolInputRoot = self.xmlRoot.find("inputs")

        toolDataInputs = []
        for anInputParam in toolInputRoot:
            if anInputParam.attrib['type'] == 'data':
                aDataInput = {'label' : anInputParam.attrib['label'], 'dataFormat': anInputParam.attrib['format'], 'referenceVariable': anInputParam.attrib['name']}
                toolDataInputs.append(aDataInput)

        return toolDataInputs












galaxyXML = ET.parse('filters/lav_to_bed.xml')
root = galaxyXML.getroot()



tc = ParseToolInput(root)

print (tc.getToolDataInputDefinition())





# for aChild in root:
#     print (aChild.tag+" " + aChild.text)
#

#print  root.tag


