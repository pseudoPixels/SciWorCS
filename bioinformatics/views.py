from bioinformatics import bioinformatics

#Importing required libraries
import os, subprocess, glob, ntpath, zipfile, gzip, tarfile
from flask import Flask, render_template, request, redirect, jsonify
from werkzeug.datastructures import FileStorage
from subprocess import call

#Libraries for downloading
# import wget
# import socket
#import paramiko
#from paramiko import util
# import SSHLibrary
# from stat import S_ISDIR
# from flask import make_response
# import urllib
# from urllib import urlretrieve
# from urllib import urlencode
# from urllib import URLopener
# import urllib.request

app = Flask(__name__)
APP_ROOT = os.path.dirname(os.path.abspath(__file__))

# ======================================================================================================================

def transform(text_file_contents):
    return text_file_contents.replace("=", ",")

#Function that gives the filename from a path that is given as a string
def path_leaf(path):
    head, tail = ntpath.split(path)
    return tail or ntpath.basename(head)

def error(errorMessage):
    return render_template("bio_upload.html", errorMessage=errorMessage, title="Error", inputAlert="none",
                           errorAlert="block", hideLoc="none", fastqc="none", flash="none", download="none")

def success(nameList, locList, fastqcList, task):
    # Return list of exact filenames, file paths, and fastqc names for FastQC method
    if task == "FastQC Upload":
        return render_template("bio_upload.html", fileName=nameList, fileLoc=locList, fastqcName=fastqcList,
                               title='Upload Complete', inputAlert="block", errorAlert="none", hideLoc="block",
                               fastqc="block", flash="none", download="block")
    # Return list of exact filenames, file paths, and fastqc names for FLASH method
    elif task == "FLASH Upload":
        return render_template("bio_upload.html", fileName=nameList, fileLoc=locList, fastqcName=fastqcList,
                               title='Upload Complete', inputAlert="block", errorAlert="none", hideLoc="block",
                               fastqc="none", flash="block", download="block")
    # Return list of exact filenames, file paths, and fastqc names of files downloaded
    elif task == "Download":
        return render_template("bio_upload.html", fileName=nameList, fileLoc=locList, fastqcName=fastqcList,
                               title='Download Complete', inputAlert="block", errorAlert="none", hideLoc="none",
                               fastqc="none", flash="none", download="none")
    else:
        return error("Internal Server Error")

def file_name(file, inputType):
    # Finding filename when user submits through regular expression method
    if inputType == "text":
        filename = path_leaf(file)
    # Finding filename when user submits through file selector
    elif inputType == "file":
        filename = file.filename
    else:
        filename = ""
        return error("Internal Server Error")
    return filename

def extract_zipfile(file, newTarget):
    zip_ref = zipfile.ZipFile(file, 'r')
    zip_ref.extractall(newTarget)
    zip_ref.close()

def extract_tarfile(file, newTarget):
    tar = tarfile.open(file)
    tar.extractall(newTarget)
    tar.close()

def extract_file(file, filename, target):
    # Name and path of folder in which input files will be extracted to
    newLoc = 'decomp_' + str(filename) + '/'
    newTarget = os.path.join(target, newLoc)

    # If folder already exists in path, change name of folder where input files will be extracted to
    if os.path.isdir(newTarget):
        currentNum = 2
        currentTarget = newTarget
        while os.path.isdir(currentTarget):
            currentLoc = 'decomp_' + str(filename) + '_' + str(currentNum) + '/'
            currentTarget = os.path.join(target, currentLoc)
            currentNum += 1
        newTarget = currentTarget
        os.mkdir(newTarget)
        # Create directory for new target
        os.mkdir(newTarget)

    # Method for extracting files if compressed folder has ".tar.gz" or ".gz" extension
    if filename.endswith('.tar.gz') or filename.endswith('.gz') or filename.endswith('.tar'):
        extract_tarfile(file, newTarget)
    # Method for extracting files if compressed folder has ".zip" extension
    elif filename.endswith('.zip'):
        extract_zipfile(file, newTarget)
    else:
        return error("Internal Server Error")

    return (newLoc, newTarget)

def fastqc(absDest):
    subprocess.Popen(["/usr/bin/perl", "/home/ubuntu/Webpage/fastqc_wrapper/FastQC/fastqc", "-i", str(absDest)]).communicate()

def flash(filename, absDest, relOutput):
    # Relative path for where output files will be generated
    # flashPath = os.path.join(APP_ROOT, "FLASH-1.2.11/")
    flashPath = os.path.join(APP_ROOT, "static/")
    # Changing cmd directory relatively in order to run FLASH tool
    os.chdir(flashPath)
    flashOutput = os.path.join(flashPath, "flash_output")
    outputFolder = os.path.join(relOutput, "output_" + str(filename))
    flashTarget = os.path.join(flashOutput, outputFolder)
    # Creating directory if it does not already exist
    if not os.path.isdir(flashTarget):
        os.mkdir(flashTarget)
    # Calling FLASH function for file
    subprocess.Popen(["/home/ubuntu/Webpage/bioinformatics/FLASH-1.2.11/flash", "--interleaved-input", str(absDest), "-d", str(flashTarget)]).communicate()
    # Changing cmd directory back to what it was before
    os.chdir("../")

def extracted_files_list(newTarget):
    # When extracting files, python libraries create a new folder in the target path
    # The following tasks are carried out to edit file paths respectively
    decompFolder = os.listdir(newTarget)
    for name in decompFolder:
        folderName = name
    decompFolderLoc = os.path.join(newTarget, folderName)
    decompFileList = os.listdir(decompFolderLoc)
    newFileList = []
    for decompFile in decompFileList:
        decompFilePath = os.path.join(decompFolderLoc, decompFile)
        newFileList.append(decompFilePath)
    return (decompFolder, folderName, decompFolderLoc,\
           decompFileList, decompFilePath, newFileList)

def upload_to_server(file, destination, inputType):
    # Method for uploading file to server when user submits through regular expression method
    if inputType == "text":
        with open(str(file), 'rb') as fp:
            file = FileStorage(fp)
            file.save(destination)
    # Method for uploading file to server when user submits through file selector method
    elif inputType == "file":
        file.save(destination)
    else:
        return error("Internal Server Error")

def set_make_target(path):
    target = os.path.join(APP_ROOT, str(path))  # Setting target path for output files
    # If path does not already exist, create the target path
    if not os.path.isdir(target):
        os.mkdir(target)
    return (target)

def check_user_input(inputType):

    # Tasks to be carried out if user inputs text for regular expressions
    if inputType == "text":
        userDir = request.form["textDir"]  # Text input by user for path of folder containing input files
        userRegex = request.form["textRegex"]  # Text input by user for regular expression
        # Checks if both text inputs are not empty when button is clicked
        if userDir != '' or userRegex != '':
            userPath = os.path.join(userDir, userRegex)
            absPath = os.path.abspath(userPath)
            fileList = glob.glob(str(absPath))
        # Return an error if both text inputs are empty
        else:
            userPath = ""
            absPath = ""
            fileList = ""
            return error("Input Required")

    # Task to be carried out if user uses file selector to select input files
    elif inputType == "file":
        fileList = request.files.getlist("file")
        userDir = ""
        userRegex = ""
        userPath = ""
        absPath = ""

    else:
        fileList = ""
        userDir = ""
        userRegex = ""
        userPath = ""
        absPath = ""
        return error("Internal Server Error")

    return (userDir, userRegex, userPath, absPath, fileList)

def upload_lists(filename, nameList, fastqcList, tool,
                 isDecompFile, newLoc, folderName):

    if tool == "FastQC":
        # Change of name for files with ".fastq" extension in order to be able to preview output files
        if filename.endswith('.fastq'):
            newName = filename.replace('.fastq', '')
            if isDecompFile == "no":
                nameList.append(str(filename))
                fastqcList.append(str(newName))
            elif isDecompFile == "yes":
                nameList.append(str(newLoc) + str(folderName) + '/' + str(filename))
                fastqcList.append(str(newLoc) + str(folderName) + '/' + str(newName))
        # No change of name for files with other extensions
        else:
            if isDecompFile == "no":
                nameList.append(str(filename))
                fastqcList.append(str(filename))
            elif isDecompFile == "yes":
                name = str(newLoc) + str(folderName) + '/' + str(filename)
                nameList.append(name)
                fastqcList.append(name)

    # Task for FLASH tool
    elif tool == "FLASH":
        if isDecompFile == "no":
            nameList.append(str(filename))
        elif isDecompFile == "yes":
            nameList.append(str(newLoc) + str(folderName) + '/' + str(filename))

    else:
        return error("Internal Server Error")

    return (nameList, fastqcList)

def compress(filePath):
    subprocess.call(['python', '-m', 'zipfile', '-c', str(filePath) + ".zip", filePath])

def output_path_list(path):
    # Path where output files were generated
    outputPath = os.path.join(APP_ROOT, str(path))
    outputList = os.listdir(outputPath)
    return (outputPath, outputList)

def add_FLASH_output(file, filePath, outputPath, nameList, locList):
    outputFolderPath = os.path.join(filePath, file)
    outputFolderList = os.listdir(outputFolderPath)
    for output in outputFolderList:
        outputFilePath = os.path.join(outputFolderPath, output)
        outputName = outputFilePath.replace(outputPath, '')
        nameList.append(outputName)
        locList.append(outputFilePath)
    return (outputFolderPath, outputFolderList, outputFilePath, outputName,\
           nameList, locList)

def add_FastQC_output(file, filename, nameList, locList, fastqcList,
                      isDecomp, filePath, outputPath):
    # Only adding names of files to fastqc list if they have ".html" extension
    if filename.endswith("_fastqc.html"):
        # Editing filename accoringly, in order to be able to preview output files
        newS = filename.replace('_fastqc.html', '')
        fastqcList.append(newS)
    if isDecomp == "yes":
        decompFilePath = os.path.join(filePath, file)
        decompName = decompFilePath.replace(outputPath, '')
        nameList.append(decompName)
        locList.append(decompFilePath)
    elif isDecomp == "no":
        decompFilePath = ""
        decompName = ""
        nameList.append(filename)
        locList.append(file)
    else:
        decompFilePath = ""
        decompName = ""
        return error("Internal Server Error")
    return (decompFilePath, decompName, nameList, locList, fastqcList)

def download_lists(outputList, outputPath, nameList, locList, fastqcList):
    # Tasks to be carried out for each file in output folder
    for aFile in outputList:
        filename = path_leaf(aFile)  # Filename
        # If filename starts with "decomp_", it is a folder that may contain multiple files in it
        # This is the folder in which files were extracted to from a compressed folder
        if filename.startswith('decomp_'):
            # Tasks to be carried out in order to find filenames and file paths of each file in the folder
            decompFolderPath = os.path.join(outputPath, aFile)
            decompFolderList = os.listdir(decompFolderPath)
            for theFolder in decompFolderList:
                theFolderPath = os.path.join(decompFolderPath, theFolder)
                theFolderList = os.listdir(theFolderPath)
                for decompFile in theFolderList:
                    outputFileName = path_leaf(decompFile)

                    # Method for FLASH tool
                    if outputFileName.startswith("output_"):
                        outputFolderPath, outputFolderList, outputFilePath, outputName, nameList, locList = add_FLASH_output(decompFile, theFolderPath, outputPath, nameList, locList)
                    # Method for FastQC tool
                    else:
                        decompFilePath, decompName, nameList, locList, fastqcList = add_FastQC_output(decompFile, outputFileName, nameList, locList, fastqcList,
                                                                                                      "yes", theFolderPath, outputPath)
        elif filename.startswith("output_"):
            outputFolderPath, outputFolderList, outputFilePath, outputName, nameList, locList = add_FLASH_output(aFile, outputPath, outputPath, nameList, locList)
        # Filename and file path of individual files (not folders)
        else:
            decompFilePath, decompName, nameList, locList, fastqcList = add_FastQC_output(aFile, filename, nameList, locList, fastqcList,
                                                                                          "no", "none", "none")
    return (nameList, locList, fastqcList)

# ======================================================================================================================

@bioinformatics.route("/bioinformatics/")
def bio_index():
    return render_template("bio_upload.html", title="Upload", inputAlert="none", errorAlert="none",
                           hideLoc="none", fastqc="none", flash="none", download="none")

@bioinformatics.route('/bioinformatics/upload', methods=['GET','POST'])
def bio_upload():

    locList = []
    nameList = []
    fileList = []
    fastqcList = []

    # Getting inputs from forms
    userText = request.form.get('text', None)           # Text input for regular expressions
    userFile = request.form.get('file', None)           # From file selector

    if userText == "Execute FastQC" or userFile == "Execute FastQC":
        target = set_make_target('static/fastqc_output/')
    elif userText == "Execute FLASH" or userFile == "Execute FLASH":
        # target = set_make_target('FLASH-1.2.11/flash_output/')
        target = set_make_target('static/flash_output/')

    if userText == "Execute FastQC" or userText == "Execute FLASH":
        userDir, userRegex, userPath, absPath, fileList = check_user_input("text")
    elif userFile == "Execute FastQC" or userFile == "Execute FLASH":
        userDir, userRegex, userPath, absPath, fileList = check_user_input("file")

    # Tasks to be carried out for each input file
    for file in fileList:

        if userText == "Execute FastQC" or userText == "Execute FLASH":
            filename = file_name(file, "text")
        elif userFile == "Execute FastQC" or userFile == "Execute FLASH":
            filename = file_name(file, "file")

#=======================================================================================================================

        # #Testing downloading method
        # file_contents = file.stream.read().decode("utf-8")
        # result = transform(file_contents)
        # response = make_response(result)
        # # response.headers["Content-Disposition"] = "attachment; filename=result.csv"
        # response.headers["Content-Disposition"] = "attachment; filename=" + str(filename)
        # return response

# =======================================================================================================================

        # Return an error if file inputs are empty
        if filename == '' or filename == None:
            return error("Input Required")
        # Tasks to be carried out in order to extract input files from a compressed folder
        elif filename.endswith('.tar.gz') or filename.endswith('.gz') or filename.endswith('.tar') or filename.endswith('.zip'):
            newLoc, newTarget = extract_file(file, filename, target)
            decompFolder, folderName, decompFolderLoc, decompFileList, decompFilePath, newFileList = extracted_files_list(newTarget)

            # Tasks to be carried out for each file in the compressed folder, just like those carried out for individual input files
            for newFile in newFileList:
                newFileName = file_name(newFile, "text")

                # Return an error if folder has no files in it
                if newFileName == '' or newFileName == None:
                    return error("Input Required")
                else:
                    if userText == "Execute FastQC" or userFile == "Execute FastQC":
                        nameList, fastqcList = upload_lists(newFileName, nameList, fastqcList, "FastQC",
                                     "yes", newLoc, folderName)
                    elif userText == "Execute FLASH" or userFile == "Execute FLASH":
                        nameList, fastqcList = upload_lists(newFileName, nameList, fastqcList, "FLASH",
                                     "yes", newLoc, folderName)

                    absDest = os.path.abspath(newFile)  # Absolute path of file

                    # Calling FastQC function for file
                    if userText == "Execute FastQC" or userFile == "Execute FastQC":
                        fastqc(absDest)
                    # Tasks to be carried out for the FLASH tool
                    elif userText == "Execute FLASH" or userFile == "Execute FLASH":
                        flash(newFileName, absDest, decompFolderLoc)

                    locList.append(str(absDest))  # Location of file

        # Tasks to be carried out for each input file (that are not in compressed folders)
        # else:
        elif filename.endswith(".fastq") or filename.endswith(".GZIP"):

            if userText == "Execute FastQC" or userFile == "Execute FastQC":
                nameList, fastqcList = upload_lists(filename, nameList, fastqcList, "FastQC",
                             "no", "none", "none")
            elif userText == "Execute FLASH" or userFile == "Execute FLASH":
                nameList, fastqcList = upload_lists(filename, nameList, fastqcList, "FLASH",
                             "no", "none", "none")

            # Destination of output file
            destination = os.path.join(target, filename)
            # destination = "/".join([target, filename])

            if userText == "Execute FastQC" or userText == "Execute FLASH":
                upload_to_server(file, destination, "text")
            elif userFile == "Execute FastQC" or userFile == "Execute FLASH":
                upload_to_server(file, destination, "file")

            absDest = os.path.abspath(destination)  # Absolute path of output file

            # Calling FastQC funtion for file
            if userText == "Execute FastQC" or userFile == "Execute FastQC":
                fastqc(absDest)
            # Tasks to be carried out for the FLASH tool
            elif userText == "Execute FLASH" or userFile == "Execute FLASH":
                flash(filename, absDest, "")

            locList.append(str(absDest))  # Location of file

        else:
            return error("Wrong Input File(s)")

    if userText == "Execute FastQC" or userFile == "Execute FastQC":
        return success(nameList, locList, fastqcList, "FastQC Upload")
    elif userText == "Execute FLASH" or userFile == "Execute FLASH":
        return success(nameList, locList, fastqcList, "FLASH Upload")
    else:
        return error("Internal Server Error")

#Tasks to be carried out when user clicks one of the download buttons
@bioinformatics.route('/bioinformatics/download', methods=['GET', 'POST'])
def bio_download():

    nameList = []
    locList = []
    fastqcList = []

    # Getting form data which will be later used to check which button was clicked
    downloadFile = request.form.get('download', None)

    if downloadFile == "Download FastQC Output":
        outputPath, outputList = output_path_list('static/fastqc_output')
    elif downloadFile == "Download FLASH Output":
        # outputPath, outputList = output_path_list('FLASH-1.2.11/flash_output')
        outputPath, outputList = output_path_list('static/flash_output')

    # Text input by user if they want to download files to a specific path
    userDownloadDir = request.form["downloadDir"]
    # Text input by user for name of zip folder that will contain all output files
    userDownloadName = request.form["downloadName"]

    # If no download path is specified, path will be set to downloads folder by default
    if userDownloadDir == "" or userDownloadDir == None:
        dir = os.path.expanduser('~/Downloads')
    # Otherwise, will set download path to that given by user
    else:
        dir = userDownloadDir

    # If no name is specified for zip folder, default settings will be used
    if userDownloadName == "" or userDownloadName == None:
        if downloadFile == "Download FastQC Output":
            name = 'fastqc_output.zip'
        else:
            name = 'flash_output.zip'
    # Otherwise, will set name of zip folder to that given by user
    else:
        name = str(userDownloadName) + '.zip'

    downloadDir = os.path.join(dir, name)  # Download directory

    compress(outputPath)

# =======================================================================================================================

    #Attempt #1 for downloading
    # wget.download('http://p2irc-cloud.usask.ca/bioinformatics/static/fastqc_output.zip', downloadDir)
    # wget.download('http://p2irc-cloud.usask.ca/bioinformatics/static/fastqc_output.zip')

    #Attempt #2 for downloading
    # fileDownload = urllib.URLopener()
    # fileDownload.retrieve("http://p2irc-cloud.usask.ca/bioinformatics/static/fastqc_output.zip", downloadDir)

    #Attempt #3 for downloading
    # urllib.request.urlretrieve("http://p2irc-cloud.usask.ca/bioinformatics/static/fastqc_output.zip", name)

    #Attempt #4 for downloading
    # subprocess.call(['python', 'scp', '-r', 'bioinformatics/static/fastqc_output/', str(socket.gethostname()) + ':~/Downloads/'])
    # subprocess.call(['scp', '-r', 'bioinformatics/static/fastqc_output/', 'bbs048@sr-p2irc-big14:~/Downloads/'])

    #cmd funtion: 'uname -a' to find operating system

    #Attempt #5 for downloading
    # ssh = paramiko.SSHClient()
    # ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    # ssh.connect('128.233.6.242', username="ubuntu", password="@p2irc-cloud$")
    # sftp = ssh.open_sftp()
    # localpath = 'static/fastqc_output.zip'
    # # remotepath = '/opt/crestelsetup/patchzip/abc.txt'
    # remotepath = downloadDir
    # sftp.get(localpath, remotepath)
    # sftp.close()
    # ssh.close()

    #Attemp #6 for downloading (Downloads files individually; works through file selector method only)
    # file_contents = file.stream.read().decode("utf-8")
    # result = transform(file_contents)
    # response = make_response(result)
    # response.headers["Content-Disposition"] = "attachment; filename=result.csv"
    # return response

    # Attemp #7 for downloading
    # os.system('scp -r bioinformatics/static/fastqc_output/ bbs048@sr-p2irc-big14:~/Downloads/')

    #Links for above methods of downloading
    # https: // askubuntu.com / questions / 157381 / in -ssh - how - do - i - mv - to - my - local - system
    # https: // unix.stackexchange.com / questions / 139437 / how - to - copy - a - file - from -a - remote - network - to - the - local - desktop
    # https: // stackoverflow.com / questions / 29508743 / download - files - over - ssh - using - python

    #Original method for downloading
    # # Downloading zip folder to download path
    # with open(str(outputPath) + ".zip", 'rb') as fp:
    #     file = FileStorage(fp)
    #     file.save(downloadDir)

    #Attempt #8 for downloading
    # fileDowload = urllib.URLopener()
    # if downloadFile == "Download FastQC Output":
    #     # url = urllib.urlencode("http://p2irc-cloud.usask.ca/bioinformatics/static/fastqc_output.zip")
    #     # return urllib.urlretrieve(url, str(name))
    #     return fileDowload.retrieve("http://p2irc-cloud.usask.ca/bioinformatics/static/fastqc_output.zip", str(name))
    # elif downloadFile == "Download FLASH Output":
    #     # url = urllib.urlencode("http://p2irc-cloud.usask.ca/bioinformatics/FLASH-1.2.11/flash_output.zip")
    #     # return urllib.urlretrieve(url, str(name))
    #     return fileDowload.retrieve("http://p2irc-cloud.usask.ca/bioinformatics/FLASH-1.2.11/flash_output.zip", str(name))

    # Attempt #9 for downloading
    # server, username, password = ('p2irc-cloud', 'ubuntu', 'cfref2016')
    # ssh = paramiko.SSHClient()
    # paramiko.util.log_to_file("ssh.log")
    # ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    # ssh.connect(server, username=username, password=password)
    # ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command('ls')
    # error = ssh_stderr.read()
    # # Transfering files to and from the remote machine
    # sftp = ssh.open_sftp()
    # sftp.get("/home/ubuntu/Webpage/bioinformatics/static/fastqc_output.zip", "/home/bbs048/Downloads")
    # sftp.close()
    # ssh.close()
    # return sftp

    # export PYTHONPATH=/usr/lib/python3/dist-packages

# =======================================================================================================================

    # # Deleting zip folder that was created in the server
    # os.remove(str(outputPath) + ".zip")

    nameList, locList, fastqcList = download_lists(outputList, outputPath, nameList, locList, fastqcList)
    if downloadFile == "Download FastQC Output" or downloadFile == "Download FLASH Output":
        return success(nameList, locList, fastqcList, "Download")
    else:
        return error("Internal Server Error")

@bioinformatics.route("/bioinformatics/photoscan", methods=['POST'])
def bio_photoscan():
    photoscanPath = os.path.join(APP_ROOT, "photoscan-pro/")
    os.chdir(photoscanPath)
    subprocess.Popen(["./photoscan.sh"])
    os.chdir("../")
    return "Agisoft PhotoScan Opened"
