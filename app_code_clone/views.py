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
    COUCHDB_DATABASE='plantphenotype'
)

manager = CouchDBManager()
with app.app_context():
	manager.setup(app)
	#manager.add_viewdef([views_by_txl_user, views_by_txl_project_authors, views_by_txl_project_shared_members])
	manager.sync(app)
















@app_code_clone.route('/ccv')
def ccv():

	thisUser = 'golammostaeen@gmail.com'
	projectRoot = 'app_code_clone/user_projects/'

	list_of_file_for_validation = os.listdir(projectRoot + thisUser + '/' )


	return render_template('quick_validation.html', list_of_file_for_validation = list_of_file_for_validation)







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

























