from app_code_clone import app_code_clone
from flask import render_template



from flask import Flask,render_template,jsonify, g, redirect, url_for, session
from io import StringIO
import sys
import subprocess
import tempfile
from flask import request
import os
import uuid



import xml.etree.ElementTree as ET
#import BeautifulSoup

#for couch db...
from couchdb.design import ViewDefinition
from flaskext.couchdb import CouchDBManager




views_by_txl_user = ViewDefinition('hello', 'findEmailAndDocID', '''
	function (doc) {
		if (doc.the_doc_type == 'txl_user') {
			emit(doc.user_email, doc._id)
		};
	}
	''')




views_by_txl_project_authors = ViewDefinition('hello', 'findTXLProjectAuthors', '''
	function (doc) {
		if (doc.the_doc_type == 'txl_project') {
			emit(doc.author, doc._id)
		};
	}
	''')


views_by_txl_project_shared_members = ViewDefinition('hello', 'findTXLProjectSharedMembers', '''
	function (doc) {
		if (doc.the_doc_type == 'txl_project') {
			emit(doc.shared_with, doc._id)
		};
	}
	''')





from flask import current_app as app


app = Flask(__name__)
app.config.update(
    COUCHDB_SERVER='http://localhost:5984',
    COUCHDB_DATABASE='plantphenotype',
	MAX_CONTENT_LENGTH=30000000
)

manager = CouchDBManager()
with app.app_context():
	manager.setup(app)
	#manager.add_viewdef([views_by_txl_user, views_by_txl_project_authors, views_by_txl_project_shared_members])
	manager.sync(app)





import glob

@app_code_clone.route('/manual_validation')
def manual_validation():

	thisUser = 'golammostaeen@gmail.com'
	projectRoot = 'app_code_clone/user_projects/'

	#list_of_file_for_validation = os.listdir(projectRoot + thisUser + '/' )
	list_of_file_for_validation = [os.path.basename(x) for x in glob.glob(projectRoot + thisUser + '/' + '*.xml')]


	return render_template('manual_validation.html', list_of_file_for_validation = list_of_file_for_validation)







@app_code_clone.route('/machine_learning_validation')
def machine_learning_validation():

	thisUser = 'golammostaeen@gmail.com'
	projectRoot = 'app_code_clone/user_projects/'

	#list_of_file_for_validation = os.listdir(projectRoot + thisUser + '/' )
	list_of_file_for_validation = [os.path.basename(x) for x in glob.glob(projectRoot + thisUser + '/' + '*.xml')]


	return render_template('machine_learning_validation.html', list_of_file_for_validation = list_of_file_for_validation)






@app_code_clone.route('/ml_auto_validate_clone_file', methods=['POST'])
def ml_auto_validate_clone_file():

	projectRoot = 'app_code_clone/user_projects/'
	thisUser = request.form['theUser']
	theCloneFile = request.form['theCloneFile']

	mlValidation_output_file = theCloneFile+'.mlValidated'



	tree2 = ET.parse(projectRoot+thisUser+'/'+theCloneFile)
	root = tree2.getroot()
	totalClonePairs = len(root)

	mlValidationCount = 0

	if os.path.exists(projectRoot+thisUser+'/'+mlValidation_output_file) == True:
		#response_code = 'FILE_ALREADY_EXIST'
		mlValidationCount = sum(1 for line in open(projectRoot+thisUser+'/'+mlValidation_output_file))
	else:
		new_file = open(projectRoot+thisUser+'/'+mlValidation_output_file, "w")
		new_file.close()


	for aCloneIndex in range(mlValidationCount, totalClonePairs):
		fragment_1_path, fragment_1_startline, fragment_1_endline, fragment_1_clone, fragment_2_path, fragment_2_startline, fragment_2_endline, fragment_2_clone, clones_validated, total_clones = get_next_clone_pair_for_validation(
			thisUser, theCloneFile, '.mlValidated')


		false_probability, true_probability = app_code_clone_getValidationScore(fragment_1_clone, fragment_2_clone, 'java')

		with open(projectRoot+thisUser+'/'+mlValidation_output_file, "a") as validationFile:
			if true_probability >=false_probability:
				validationFile.write(str(true_probability) + ',' + fragment_1_path +','+ fragment_1_startline +','+ fragment_1_endline+','+fragment_2_path+','+fragment_2_startline+','+fragment_2_endline + '\n')
			else:
				validationFile.write(
					str(true_probability) + ',' + fragment_1_path + ',' + fragment_1_startline + ',' + fragment_1_endline + ',' + fragment_2_path + ',' + fragment_2_startline + ',' + fragment_2_endline + '\n')



	return jsonify({'status': 'Done'})


	#list_of_file_for_validation = os.listdir(projectRoot + thisUser + '/' )
	#list_of_file_for_validation = [os.path.basename(x) for x in glob.glob(projectRoot + thisUser + '/' + '*.xml')]


	#return render_template('machine_learning_validation.html', list_of_file_for_validation = list_of_file_for_validation)














@app_code_clone.route('/srv_get_next_clone_pair_for_validation', methods=['POST'])
def srv_get_next_clone_pair_for_validation():
	# getting the example program name

	projectRoot = 'app_code_clone/user_projects/'
	thisUser = request.form['theUser']
	theCloneFile = request.form['theCloneFile']
	#theValidationFile = theCloneFile + '.validated'

	# tree2 = ET.parse(projectRoot+thisUser+'/'+theCloneFile)
	# root = tree2.getroot()
    #
	# nextCloneIndex = 0
    #
	# if os.path.exists(projectRoot+thisUser+'/'+theValidationFile) == True:
	# 	#response_code = 'FILE_ALREADY_EXIST'
	# 	nextCloneIndex = sum(1 for line in open(projectRoot+thisUser+'/'+theValidationFile))
	# else:
	# 	new_file = open(projectRoot+thisUser+'/'+theValidationFile, "w")
	# 	new_file.close()
    #
    #
    #
	fragment_1_path, fragment_1_startline, fragment_1_endline, fragment_1_clone, fragment_2_path, fragment_2_startline, fragment_2_endline, fragment_2_clone, clones_validated, total_clones  = get_next_clone_pair_for_validation(
		thisUser, theCloneFile)


	# soup = ''
	# with open(projectRoot+thisUser+'/'+theCloneFile) as fp:
	# 	soup = BeautifulSoup(fp, 'lxml')
    #
    #
	# clones = soup.find_all('clone')





	return jsonify({'fragment_1_path': fragment_1_path,
					'fragment_1_startline': fragment_1_startline,
					'fragment_1_endline':fragment_1_endline,
				    'fragment_1_clone':fragment_1_clone,

					'fragment_2_path': fragment_2_path,
					'fragment_2_startline': fragment_2_startline,
					'fragment_2_endline': fragment_2_endline,
					'fragment_2_clone': fragment_2_clone,

					'clones_validated': clones_validated,
					'total_clones': total_clones
					})




def saveManualValidationResponse(theUser, theValidationFile, response, fragment_1_path, fragment_1_start_line, fragment_1_end_line, fragment_2_path, fragment_2_start_line, fragment_2_end_line):
	projectRoot = 'app_code_clone/user_projects/'

	with open(projectRoot+theUser+'/'+theValidationFile, "a") as validationFile:
		validationFile.write(response + ',' + fragment_1_path +','+ fragment_1_start_line +','+ fragment_1_end_line+','+fragment_2_path+','+fragment_2_start_line+','+fragment_2_end_line + '\n')








def get_next_clone_pair_for_validation(theUser, cloneFile, validationFileExt='.validated'):
	# getting the example program name

	projectRoot = 'app_code_clone/user_projects/'
	thisUser = theUser
	theCloneFile = cloneFile
	theValidationFile = theCloneFile + validationFileExt

	tree2 = ET.parse(projectRoot+thisUser+'/'+theCloneFile)
	root = tree2.getroot()

	nextCloneIndex = 0

	if os.path.exists(projectRoot+thisUser+'/'+theValidationFile) == True:
		#response_code = 'FILE_ALREADY_EXIST'
		nextCloneIndex = sum(1 for line in open(projectRoot+thisUser+'/'+theValidationFile))
	else:
		new_file = open(projectRoot+thisUser+'/'+theValidationFile, "w")
		new_file.close()

	#fragment_1_path, fragment_1_startline, fragment_1_endline, fragment_1_clone, fragment_2_path, fragment_2_startline, fragment_2_endline, fragment_2_clone, number_of_validated_clones, total_clones
	return root[nextCloneIndex][0].attrib['file'], root[nextCloneIndex][0].attrib['startline'], root[nextCloneIndex][0].attrib['endline'], root[nextCloneIndex][1].text, root[nextCloneIndex][2].attrib['file'], root[nextCloneIndex][2].attrib['startline'], root[nextCloneIndex][2].attrib['endline'],root[nextCloneIndex][3].text, nextCloneIndex+1, len(root)
	#return 	root[nextCloneIndex][1].text, root[nextCloneIndex][3].text












@app_code_clone.route('/save_manual_clone_validation_res_and_get_new_clone_pair', methods=['POST'])
def save_manual_clone_validation_res_and_get_new_clone_pair():

	thisUser = request.form['theUser']
	theCloneFile= request.form['theCloneFile']
	manual_validation_response= request.form['manual_validation_response']

	fragment_1_path= request.form['fragment_1_path']
	fragment_1_start_line= request.form['fragment_1_start_line']
	fragment_1_end_line= request.form['fragment_1_end_line']

	fragment_2_path= request.form['fragment_2_path']
	fragment_2_start_line= request.form['fragment_2_start_line']
	fragment_2_end_line= request.form['fragment_2_end_line']






	# getting the example program name
	#manual_validation_response = 'true'



	theValidationFile = theCloneFile + '.validated'



	saveManualValidationResponse(thisUser, theValidationFile, manual_validation_response, fragment_1_path, fragment_1_start_line, fragment_1_end_line, fragment_2_path, fragment_2_start_line, fragment_2_end_line)

	fragment_1_path, fragment_1_startline, fragment_1_endline, fragment_1_clone, fragment_2_path, fragment_2_startline, fragment_2_endline, fragment_2_clone, clones_validated, total_clones = get_next_clone_pair_for_validation(thisUser, theCloneFile)


	#
	#
	#
	#
    #
	# tree2 = ET.parse(projectRoot+thisUser+'/'+theCloneFile)
	# root = tree2.getroot()
    #
	# nextCloneIndex = 0
    #
	# if os.path.exists(projectRoot+thisUser+'/'+theValidationFile) == True:
	# 	#response_code = 'FILE_ALREADY_EXIST'
	# 	nextCloneIndex = sum(1 for line in open(projectRoot+thisUser+'/'+theValidationFile))
	# else:
	# 	new_file = open(projectRoot+thisUser+'/'+theValidationFile, "w")
	# 	new_file.close()





	# soup = ''
	# with open(projectRoot+thisUser+'/'+theCloneFile) as fp:
	# 	soup = BeautifulSoup(fp, 'lxml')
    #
    #
	# clones = soup.find_all('clone')





	# txl_source = str(txl_source, 'utf-8')
	return jsonify({'fragment_1_path': fragment_1_path,
					'fragment_1_startline': fragment_1_startline,
					'fragment_1_endline':fragment_1_endline,
				    'fragment_1_clone':fragment_1_clone,

					'fragment_2_path': fragment_2_path,
					'fragment_2_startline': fragment_2_startline,
					'fragment_2_endline': fragment_2_endline,
					'fragment_2_clone': fragment_2_clone,

					'clones_validated': clones_validated,
					'total_clones': total_clones
					})








from flask import  request
from werkzeug import secure_filename

@app_code_clone.route('/upload_new_clone_file', methods = ['GET', 'POST'])
def upload_new_clone_file():
	file = request.files['file']
	projectDir = request.form['userID']
	file.save(os.path.join('app_code_clone/user_projects/'+projectDir, secure_filename(file.filename)))
	return "Ajax file upload success"

















@app_code_clone.route('/txln', methods=['POST'])
def txln():
	# getting the txl and the input file to parse
	txl_source = request.form['txl_source']
	input_to_parse = request.form['input_to_parse']

	# generate a unique random file name for preventing conflicts
	fileName = str(uuid.uuid4())
	txl_source_file = 'app_txl_cloud/txl_tmp_file_dir/' + fileName + '.txl'

	fileName = str(uuid.uuid4())
	input_to_parse_file = 'app_txl_cloud/txl_tmp_file_dir/' + fileName + '.txt'

	# write submitted txl and input to corresponding files
	with open(txl_source_file, "w") as fo:
		fo.write(txl_source)

	with open(input_to_parse_file, "w") as fo:
		fo.write(input_to_parse)

	# parsing
	p = subprocess.Popen(['/usr/local/bin/txl', '-Dapply', txl_source_file, input_to_parse_file], stdout=subprocess.PIPE,
						 stderr=subprocess.PIPE)
	# p = subprocess.Popen(['ls'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	out, err = p.communicate()

	# once done remove the file
	#os.remove(txl_source_file)
	#os.remove(input_to_parse_file)

	# preparing the log file for better readabilty...
	# err = err.replace('\n','<br>') #add new line for html
	err = str(err,'utf-8')
	out = str(out,'utf-8')
	err = err.replace(txl_source_file, 'YOUR_TXL_FILE')
	err = err.replace(input_to_parse_file, 'YOUR_INPUT_FILE')

	return jsonify({'txl_log': err, 'txl_output': out})










@app_code_clone.route('/load_example_txl_programn', methods=['POST'])
def load_example_txl_programn():
	# getting the example program name
	example_name = request.form['txl_example_program_name']

	txl_example_program_dir = 'app_txl_cloud/txl_sources/examples/'

	file_location = txl_example_program_dir + example_name + '/' + example_name

	txl_source = ''
	with open(file_location + '.txl', 'r') as f:
		for line in f:
			txl_source = txl_source + line

	input_to_parse = ''
	with open(file_location + '.txt', 'r') as f:
		for line in f:
			input_to_parse = input_to_parse + line

	# txl_source = str(txl_source, 'utf-8')
	return jsonify({'example_txl_source': txl_source, 'input_to_parse': input_to_parse})















########################################################################################################################
########################################################################################################################
########################################################################################################################
#############################  MACHINE LEARNING MODEL ##################################################################
########################################################################################################################
########################################################################################################################
########################################################################################################################


import pickle
import pybrain


def app_code_clone_getValidationScore(sourceCode1,sourceCode2,lang='java' ):


	#load the trained Neural Net
	fileObject = open('/home/ubuntu/Webpage/pybrain/trainedNetwork', 'rb')
	loaded_fnn = pickle.load(fileObject, encoding='latin1')
	network_prediction = loaded_fnn.activate([0.2,0.5,0.6,0.1,0.3,0.7])

	#out = {'false_clone_probability_score':network_prediction[0], 'true_clone_probability_score':network_prediction[1]}


	#return jsonify({'error_msg': 'None', 'log_msg': 'Preprocessing Source Codes...\nNormalizing Source Codes...\nCalculating Similarities...\nDone.','output': out})

	#false_clone_probability_score, true_clone_probability_score
	return network_prediction[0], network_prediction[1]











