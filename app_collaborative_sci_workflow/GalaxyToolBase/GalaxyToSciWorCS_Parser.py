from io import StringIO
import sys
import subprocess
import tempfile
import os
import uuid
import glob
import xml.etree.ElementTree as ET
import shutil
import re



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
            withRemovedVarSign = withRemovedVarSign.replace('{', '')  # '{name}'  ---> 'name}'
            withRemovedVarSign = withRemovedVarSign.replace('}', '')  # 'name}'  ---> 'name'

            if withRemovedVarSign == '>' or withRemovedVarSign == '<':
                withRemovedVarSign = '"' + withRemovedVarSign + '"'

            updatedCommandList.append(withRemovedVarSign)


        return updatedCommandList #['CreateInterval.pl', 'chrom', 'start', 'end', '"name"', 'strand', 'out_file1']




    def getToolInterpreter(self):
        commandLine = self.xmlRoot.find("command")

        interpreter = ''
        if 'interpreter' in commandLine.attrib:
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
                if 'format' not in anInputParam.attrib:
                    anInputParam.attrib['format'] = 'text'
                aDataInput = {'label' : anInputParam.attrib['label'], 'dataFormat': anInputParam.attrib['format'], 'referenceVariable': anInputParam.attrib['name']}
                toolDataInputs.append(aDataInput)

        return toolDataInputs



    def getToolConfigurations(self):
        toolInputRoot = self.xmlRoot.find("inputs")

        toolConfigurations = ''
        for anInputParam in toolInputRoot:
            if anInputParam.attrib['type'] == 'integer':
                configValue = anInputParam.attrib['name'] + "=" +  anInputParam.attrib['value']
                toolConfigurations += anInputParam.attrib['label'] + ': <input type="text" class="setting_param" size="45" value="'  +  configValue  + '" /> <br/>' + '\n'

            elif anInputParam.attrib['type'] == 'select':

                selectOptions = anInputParam.attrib['label'] + ': <select class="setting_param" >' + '\n'
                for anOption in anInputParam:
                    optionValue = anInputParam.attrib['name']  + "='" +  anOption.attrib['value'] + "'"
                    selectOptions += '  <option value="' + optionValue + '">'+ anOption.attrib['value'] +'</option>'+'\n'
                selectOptions += '</select>'

                toolConfigurations += selectOptions

            else: # anInputParam.attrib['type'] == 'text': OR ANY OTHER FORMAT...
                if 'value' not in anInputParam.attrib:
                    anInputParam.attrib['value'] = ''

                configValue = anInputParam.attrib['name'] + "='" +  anInputParam.attrib['value'] + "'"
                toolConfigurations += anInputParam.attrib['label'] + ': <input type="text" class="setting_param" size="45" value="'  +  configValue  + '" /> <br/>' + '\n'

        return toolConfigurations









###############################################################
###############################################################
###############################################################
class ParseToolDocumentation:
    def __init__(self, xmlRoot):
        self.xmlRoot = xmlRoot

    def getToolDocumentation(self):
        toolDescriptionRoot = self.xmlRoot.find("description")
        toolHelpRoot = self.xmlRoot.find("help")

        return '<p> '+ toolDescriptionRoot.text + '<br/><br/>' + toolHelpRoot.text + '</p>'
































###############################################################
###############################################################
###############################################################
class ParseToolOutput:
    def __init__(self, xmlRoot):
        self.xmlRoot = xmlRoot

    def getToolDataOutputDefinition(self):
        toolOutputRoot = self.xmlRoot.find("outputs")

        toolDataOutputs = []
        for anOutput in toolOutputRoot:
            aDataOutput = {'label' : '', 'dataFormat': anOutput.attrib['format'], 'referenceVariable': anOutput.attrib['name']}
            toolDataOutputs.append(aDataOutput)

        return toolDataOutputs












###############################################################
###############################################################
###############################################################
class GalaxyToSciWorCS:
    def __init__(self):
        a=0



    def convertAndWriteToolDefinition(self, galaxyToolDefinitionPath, sciworcsDestinationPath):
        galaxyXML = ET.parse(galaxyToolDefinitionPath)
        root = galaxyXML.getroot()

        with open(sciworcsDestinationPath, "w") as SciWorCS_Defn:
            SciWorCS_Defn.write('<SciWorC>\n')


            ####################
            #### Tool inputs
            ###################
            SciWorCS_Defn.write('   <toolInputs>\n')
            toolInputs = ParseToolInput(root).getToolDataInputDefinition()

            for aToolInput in toolInputs:
                SciWorCS_Defn.write('       <toolInput>\n')
                SciWorCS_Defn.write('           <label>' + aToolInput['label'] + '</label>\n')
                SciWorCS_Defn.write('           <referenceVariable>' + aToolInput['referenceVariable'] + '</referenceVariable>\n')
                SciWorCS_Defn.write('           <dataFormat>' + aToolInput['dataFormat'] + '</dataFormat>\n')

                SciWorCS_Defn.write('       </toolInput>\n\n')
            SciWorCS_Defn.write('   </toolInputs>\n\n\n')



            ####################
            #### Tool outputs
            ###################
            SciWorCS_Defn.write('   <toolOutputs>\n')
            toolOutputs = ParseToolOutput(root).getToolDataOutputDefinition()

            for aToolOutput in toolOutputs:
                SciWorCS_Defn.write('       <toolOutput>\n')
                SciWorCS_Defn.write('           <label>' + aToolOutput['label'] + '</label>\n')
                SciWorCS_Defn.write('           <referenceVariable>' + aToolOutput['referenceVariable'] + '</referenceVariable>\n')
                SciWorCS_Defn.write('           <dataFormat>' + aToolOutput['dataFormat'] + '</dataFormat>\n')

                SciWorCS_Defn.write('       </toolOutput>\n\n')
            SciWorCS_Defn.write('   </toolOutputs>\n\n\n')




            ####################
            #### Tool  Configurations
            ###################
            SciWorCS_Defn.write('   <toolConfigurations>\n\n')
            toolConfigurations = ParseToolInput(root).getToolConfigurations()
            SciWorCS_Defn.write(toolConfigurations)
            SciWorCS_Defn.write('\n   </toolConfigurations>\n\n')




            ####################
            #### Tool  Documentation
            ###################
            SciWorCS_Defn.write('   <toolDocumentation>\n\n')
            toolDocumentation = ParseToolDocumentation(root).getToolDocumentation()
            SciWorCS_Defn.write(toolDocumentation)
            SciWorCS_Defn.write('\n   </toolDocumentation>\n\n')


            SciWorCS_Defn.write('</SciWorC>\n')




    def writeGalaxyWrapperScript(self, galaxyToolDefinitionPath, galaxyToolScriptDir, sciworcsDestinationPath):
        galaxyXML = ET.parse(galaxyToolDefinitionPath)
        root = galaxyXML.getroot()

        with open(sciworcsDestinationPath, "w") as SciWorCS_Tool:
            SciWorCS_Tool.write('\nimport subprocess\n')

            toolCommandsList = ParseToolCommand(root).getToolCommandAsList()
            toolInterpreter = ParseToolCommand(root).getToolInterpreter()
            if toolInterpreter == 'perl':
                toolInterpreter = '"/usr/bin/perl"'

            SciWorCS_Tool.write('pipe = subprocess.Popen([' + toolInterpreter)

            SciWorCS_Tool.write(', "' + galaxyToolScriptDir + '/' + toolCommandsList[0] + '"')

            for i in range(1, len(toolCommandsList)):
                SciWorCS_Tool.write(", " + toolCommandsList[i])


            SciWorCS_Tool.write(']).communicate()')




    def convertTool_GalaxyToSciWorCS(self, galaxyToolDefinitionPath, galaxyToolRelativePath, convertedToolDestinationPath, toolPrefix=''):

        #return, the tool script path does not exist
        if self.checkIfToolScriptExists(galaxyToolDefinitionPath) == False:
            return False



        # 'filters/CreateInterval.xml'   ===>    CreateInterval.xml
        sciworcsConvertedToolName = galaxyToolDefinitionPath.split('/')[len(galaxyToolDefinitionPath.split('/'))-1]
        # CreateInterval.xml    ===>   CreateInterval
        sciworcsConvertedToolName = sciworcsConvertedToolName.split('.')[0]
        # 'BioFilter_' + CreateInterval  ===>   BioFilter_CreateInterval
        sciworcsConvertedToolName = toolPrefix + sciworcsConvertedToolName

        #creating the SciWorCS Tool Directory
        sciworcsConvertedTool_DestinationDir = convertedToolDestinationPath+'/'+sciworcsConvertedToolName

        if os.path.isdir(sciworcsConvertedTool_DestinationDir) == False:
            os.makedirs(sciworcsConvertedTool_DestinationDir)

        self.convertAndWriteToolDefinition(galaxyToolDefinitionPath, sciworcsConvertedTool_DestinationDir+'/'+sciworcsConvertedToolName+'.xml')
        self.writeGalaxyWrapperScript(galaxyToolDefinitionPath, galaxyToolRelativePath, sciworcsConvertedTool_DestinationDir+'/'+sciworcsConvertedToolName+'.py')

        return True

    def checkIfToolScriptExists(self, galaxyToolDefinitionPath):
        galaxyXML = ET.parse(galaxyToolDefinitionPath)
        root = galaxyXML.getroot()

        tC = ParseToolCommand(root)
        toolInterpreter = tC.getToolInterpreter()



        galaxyToolScriptPath = ''
        if toolInterpreter == 'perl':
            galaxyToolScriptPath = galaxyToolDefinitionPath.replace('.xml', '.pl')
        elif toolInterpreter == 'python':
            galaxyToolScriptPath = galaxyToolDefinitionPath.replace('.xml', '.py')


        if os.path.exists(galaxyToolScriptPath):
            return True

        return False








TOOL_PARENT_DIR = 'filters'
CONVERTED_TOOL_PREFIX = 'Filter_'
SciWorCS_To_GALAXY_REF = '/home/ubuntu/Webpage/app_collaborative_sci_workflow/GalaxyToolBase/filters'

#list all xml galaxy tool definition files
listOfGalaxyToolDefinitionFiles = [TOOL_PARENT_DIR+'/'+f for f in os.listdir(TOOL_PARENT_DIR) if f.endswith('xml')]

galaxyToSciWorCS = GalaxyToSciWorCS()

for aGalaxyToolDefinition in listOfGalaxyToolDefinitionFiles:
    try:
        galaxyToSciWorCS.convertTool_GalaxyToSciWorCS(aGalaxyToolDefinition, SciWorCS_To_GALAXY_REF, 'ConvertedTools_GalaxyToSciWorCS', CONVERTED_TOOL_PREFIX)
    except:
        print 'Error => ' + aGalaxyToolDefinition












#gTOs = GalaxyToSciWorCS()
#gTOs.convertAndWriteToolDefinition('filters/headWrapper.xml', 'sciTest.xml')
#gTOs.writeGalaxyWrapperScript('filters/CreateInterval.xml', 'filters', 'sciTest.py')
#gTOs.convertTool_GalaxyToSciWorCS('filters/axt_to_concat_fasta.xml', 'filters', 'ConvertedTools_GalaxyToSciWorCS', 'BioF_')
#print gTOs.checkIfToolScriptExists('filters/wig_to_bigwig.xml')




# galaxyXML = ET.parse('filters/CreateInterval.xml')
# root = galaxyXML.getroot()
#
#
#
# tc = ParseToolDocumentation(root)
#
#
#
# print (tc.getToolDocumentation())
















