from flask import Flask, jsonify, make_response, g, redirect, url_for, session
from flask import send_file
from flask import request
from flask_socketio import SocketIO, send



from skimage import data
from skimage.viewer import ImageViewer
from skimage import data
from skimage.viewer import ImageViewer
import skimage
from skimage.filters.rank import median
from skimage.morphology import disk
import os
from skimage import io
from skimage.color import rgb2gray


from skimage import data, img_as_float
from skimage.restoration import denoise_tv_chambolle, denoise_bilateral
import numpy as np
from skimage.transform import swirl

from couchdb.design import ViewDefinition
from flaskext.couchdb import CouchDBManager
from flask import render_template


app = Flask(__name__)
app.secret_key = 'development key'


#socket io start
socketio = SocketIO(app)
#socket io end

app.config.update(
    COUCHDB_SERVER='http://localhost:5984',
    COUCHDB_DATABASE='baseball'
)


views_by_user = ViewDefinition('hello', 'myind', '''
    function (doc) {
         if (doc.username && doc.password) {
            emit(doc._id, doc.password)
        };   
    }
    ''')

views_by_email = ViewDefinition('hello', 'findEmailAndPassword', '''
	function (doc) {
		if (doc.the_doc_type && doc.the_doc_type == 'p2irc_user') {
			emit(doc.email, doc._id)
		};
	}
	''')


views_by_non_validated_clones = ViewDefinition('hello', 'my_non_validated_clones', '''
    function (doc) {
         if (doc.is_clone_doc == 'yes' && doc.is_validated_by_any_user == 'no') {
            emit(doc._id, doc)
        };   
    }
    ''')

views_by_pipeline_module = ViewDefinition('hello', 'pipeline_module', '''
    function (doc) {
         if (doc.is_pipeline_module == 'yes') {
            emit(doc.module_id, doc._id)
        };   
    }
    ''')


views_by_saved_pipeline = ViewDefinition('hello', 'saved_pipeline', '''
    function (doc) {
         if (doc.the_doc_type && doc.the_doc_type == 'saved_pipeline') {
            emit(doc.author, doc._id)
        };   
    }
    ''')





manager = CouchDBManager()
manager.setup(app)
manager.add_viewdef([views_by_user, views_by_non_validated_clones, views_by_pipeline_module, views_by_email, views_by_saved_pipeline])
manager.sync(app)



tasks = [
    {
        'id': 1,
        'title': u'Buy groceries',
        'description': u'Milk, Cheese, Pizza, Fruit, Tylenol', 
        'done': False
    },
    {
        'id': 2,
        'title': u'Learn Python',
        'description': u'Need to find a good Python tutorial on the web', 
        'done': False
    }
]

@app.route('/')
def hello():
    #return 'hello'
    return render_template('index.html')




############ BIO STARTS #############################
import pandas
import networkx
import scipy.stats as stats

#this function removes data that is all zeros in a column
#best used once merging has taken place to get rid of all OTUs that are zero in both conditions
def remove_zero_data(df):
    return (df.loc[:, (df > min_count).any(axis=0)])

#Add one smoothing adds one to every cell then divides by the total, normalizing everything
#this is equivilent to having a uniform prior on the distriubtion of variables
#necessary for KL-Divergence calculation
def add_one_smoothing(df):
    temp  = df.copy() + 1
    temp = temp/df.sum()
    return temp

#this function computes the correlation matrix necessary to generate the graph
#any correlation supported by DataFrame.corr can be passed in
#Once MIC is implemented it will be added
def find_correlation(df, corr_type='spearman'):
    df_r = 0
    if corr_type == 'MIC':
        print('not yet implemented')
    else:
        df_r = df.corr(corr_type)
    if isinstance(df_r, pandas.DataFrame):
        df_r.fillna(0,inplace=True)  # ugly hack to make the NAs go away, should work for sampling but not advisable
        df_r = df_r[(df_r != 0).any(axis=1)]
        df_r = df_r.loc[:, (df_r != 0).any(axis=0)]

    return df_r

#this function returns the sorted centrality for a given centrality
#given a dataframe organized as an adjacency matrix, build a graph and compute the centrality
#return sorted centrality and the graph in networkx format
def find_centrality(df, cent_type='betweenness', keep_thresh=0.5):
    df_b = df.copy()
    df_b[(df.abs() < keep_thresh)] = 0 #eliminate edges that are too weak
    labels = list(df_b.index)
    temp = abs(df_b.copy())
    temp.insert(0, 'var1', labels)
    df_b = pandas.melt(temp, 'var1', var_name='var2', value_name='edge')
    df_b = df_b.loc[(df_b['edge'] > 0), :]  # take only those edge pairs that made the cut
    df_g = networkx.from_pandas_dataframe(df_b, 'var1', 'var2', 'edge')  # takes a list of valid edges
    if cent_type == 'betweenness':
        centrality = networkx.betweenness_centrality(df_g)
    elif cent_type == 'degree':
        centrality = networkx.degree_centrality(df_g)
    elif cent_type == 'closeness':
        centrality = networkx.closeness_centrality(df_g)
    elif cent_type == 'eigenvector':
        centrality = networkx.eigenvector_centrality(df_g)
    else:
        #print('error, unknown centrality')
        return -1
    centrality_df = pandas.DataFrame.from_dict(centrality, orient='index')
    centrality_df.sort_values(0, axis=0, ascending=False, inplace=True)
    centrality_df = centrality_df.transpose()

    return centrality_df, df_g

#this function returns the KL divergence of two matched dataframes
#if the dataframes have more than one dimension they are flattened
#dataframes cannot contain zeros
def find_kl_divergence(df_A, df_B):
    if len(df_A.shape) > 1: #if there is more than one dimension, flatten
        tempA = df_A.values.flatten()
    else:
        tempA = df_A.values

    if len(df_B.shape) > 1: #if there is more than one dimension, flatten
        tempB = df_B.values.flatten()
    else:
        tempB = df_B.values

    kl_diverge = stats.entropy(tempA, tempB, 2.0) #find the KL-Divergence base 2
    if kl_diverge > 1e50:
        kl_diverge = 1e50

    return kl_diverge

############ BIO ENDS #############################






#mainline program
#parameters necessary for the pipeline
#should be refactored as command line arguements in the future
in_file_path = 'bioFiles/'
out_file_path = 'bioFiles_out/'
num_to_pull = 1
corr_thresh = 0.4
min_count = 3
num_required = 50



@app.route('/bio')
def bio():
	

	#open the files
	brome1 = pandas.DataFrame.from_csv(in_file_path+'brome1A.csv') #read in input files
	brome2 = pandas.DataFrame.from_csv(in_file_path+'brome2A.csv')
	brome1_2 = brome1.append(brome2)
	#print("files read")

	#Do some initial data formatting and cleaning
	working_df_A = brome1.sum(axis=0).transpose() #KL divergence requires that histograms are the same size so sum to remove differences in number of samples
	working_df_B = brome2.sum(axis=0).transpose()
	working_df = add_one_smoothing(remove_zero_data(brome1_2.copy()))
	working_df_A = add_one_smoothing(working_df_A.loc[working_df.columns]) #make sure that everything has the same number of columns
	working_df_B = add_one_smoothing(working_df_B.loc[working_df.columns])

	#loop working variable declaration
	max_length = len(brome1_2.columns) #if you iterate over all OTUs you must be done
	i = 0
	downsampled_df = pandas.DataFrame()
	diverge_vals = []
	max_iter = len(working_df.columns)
	#this is the select N bit, needs to be refactored into a function, but it also controls the looping and
	#calls all the rest of the functions, so might wait until more components exist to do it right
	while num_required > i*num_to_pull and i < max_iter:
		w_corr_df = find_correlation(working_df) #find the correlation
		cent_df,corr_graph = find_centrality(w_corr_df) #find the centrality
		drop_list = list(cent_df.columns[0:num_to_pull]) #find the top N OTU names
		downsampled_df = downsampled_df.append(cent_df.loc[:,drop_list]) #append them to the solution
		working_df.drop(drop_list, inplace=True, axis=1) #drop them from the inputs
		working_df_A.drop(drop_list, inplace=True)
		working_df_B.drop(drop_list, inplace=True)
		diverge_vals.append(find_kl_divergence(working_df_A, working_df_B)) #determine if the remaining histograms are more alike after elimination
		#print(i) #output progress, should eventually refactor a silent mode
		#print(diverge_vals[i])
		#print(drop_list)
		i = i + 1


	#print('downsampling complete!')
	#output results
	#more results are possible from intermediate steps, should eventually refactor a verbose mode
	working_df_A.to_csv(out_file_path+'brome1A_pruned.csv')
	working_df_B.to_csv(out_file_path+'brome2A_pruned.csv')
	working_df.to_csv(out_file_path+'brome12A_pruned.csv')
	downsampled_df.to_csv(out_file_path+'brome12_down.csv')
	temp = pandas.Series(diverge_vals)
	temp.to_csv(out_file_path+'brome12_converge.csv')
	return render_template('index.html')







########CODE CLONE VALIDATION STARTS






from flaskext.couchdb import Document, TextField, FloatField, DictField, Mapping,ListField


# class PlantPhenotype(Document):
#     source = TextField()
#     imglink = TextField()
#     annotation = TextField()
class CodeClones(Document):
	

	clone_id = TextField()
	tool = DictField(Mapping.build(id=TextField(),name=TextField()))
	system = DictField(Mapping.build(
		id=TextField(),
		name=TextField()
	))
	fragment_1 = DictField(Mapping.build(
		path=TextField(),
		start_line=TextField(),
		end_line=TextField()
	))
	fragment_2 = DictField(Mapping.build(
		path=TextField(),
		start_line=TextField(),
		end_line=TextField()
	))
	auto_validation_result = ListField(DictField(Mapping.build(
		algorithm = TextField(),
		result = TextField()
	)))
	is_validated_by_any_user = TextField(default='no')
	is_clone_doc = TextField(default='yes')
	user_validation_result = ListField(DictField(Mapping.build(
		user = TextField(),
		result = TextField()
	)))



import pandas as pd
def load_dataSet(fileName, data_columns):
	data = pd.read_csv(fileName, sep=',', header=None)
	data.columns = data_columns
	return data


    
@app.route('/load_docs_from_csv')
def load_docs_from_csv():
	data_columns = ["clone_id","tool","system","fragment_1_path", "fragment_1_start","fragment_1_end", "fragment_2_path", "fragment_2_start", "fragment_2_end","neural_net", "svm"]
	data = load_dataSet('Dataset/fileinfotemp.csv', data_columns)

	for i in range(data.shape[0]):
		c = CodeClones()
		c.clone_id = data.at[i, 'clone_id']
		c.tool.id = data.at[i, 'tool']
		c.system.id = data.at[i, 'system']
		c.fragment_1.path = 'clones/' + str(data.at[i, 'fragment_1_path']).strip('"')
		c.fragment_1.start_line = data.at[i, 'fragment_1_start']
		c.fragment_1.end_line = data.at[i, 'fragment_1_end']
		c.fragment_2.path = 'clones/' + str(data.at[i, 'fragment_2_path']).strip('"')
		c.fragment_2.start_line = data.at[i, 'fragment_2_start']
		c.fragment_2.end_line = data.at[i, 'fragment_2_end']
		c.auto_validation_result.append(algorithm='Neural Network', result=data.at[i, 'neural_net'])
		c.auto_validation_result.append(algorithm='SVM', result=data.at[i, 'svm'])

		c.store()

	sources = []
	return render_template('codeclone_validation.html', content=sources)






import itertools

def getCodeFragment(path, start_line, end_line):
	codeFragment = ''
	with open(str(path).strip('"'), "r") as text_file:
		for line in itertools.islice(text_file, int(start_line), int(end_line)):
			codeFragment = codeFragment + line

	return codeFragment






#############################################################################
################## PIPELINE SAVING STARTS HERE ##############################
class PipelineModule(Document):
	module_id = TextField()
	module_name = TextField()
	author = TextField()
	code_link_main = TextField()
	code_link_settings = TextField()
	code_link_html = TextField()
	documentation  = TextField()


class SavedPipeline(Document):
	pipeline_name = TextField()
	author = TextField()
	pipeline_link = TextField()
	the_doc_type = TextField(default='saved_pipeline')
	shared_with = ListField(TextField())


class P2IRC_User(Document):
	first_name =  TextField()
	last_name = TextField() 
	email = TextField() 
	password = TextField()
	the_doc_type = TextField(default='p2irc_user')
	user_role = TextField(default='plant_scientist')



from io import StringIO
import sys
@app.route('/pythoncom/',  methods=['POST'])
def Python_com():

	program = request.form['textarea_source_code']
	#program = 'for i in range(3):\n    print("Python is cool")'

	
	old_stdout = sys.stdout
	redirected_output = sys.stdout = StringIO()
	res = exec(program)
	sys.stdout = old_stdout

	return redirected_output.getvalue()
	#return jsonify(res)
	#return jsonify({'allTasks':tasks})


def getModuleCodes(path):
	sourceCode = ''
	with open(path) as f:
		for line in f:
			sourceCode = sourceCode + line

	return sourceCode

def getSavedPipelines(author):
	saved_pipelines = []
	for row in (views_by_saved_pipeline(g.couch)):
		if row.key == author:
			doc_id = row.value
			thisSavedPipeline = SavedPipeline.load(doc_id)
			pipeline_name = thisSavedPipeline.pipeline_name
			pipeline_link = thisSavedPipeline.pipeline_link

			saved_pipelines.append({'doc_id':doc_id, 'pipeline_name': pipeline_name, 'pipeline_link': pipeline_link})

	return saved_pipelines

def getSharedPipelines(author):
	shared_pipelines = []
	for row in (views_by_saved_pipeline(g.couch)):
		doc_id = row.value
		thisSavedPipeline = SavedPipeline.load(doc_id)
		for i in range(len(thisSavedPipeline.shared_with)):
			if thisSavedPipeline.shared_with[i] == author:
				pipeline_name = thisSavedPipeline.pipeline_name
				pipeline_link = thisSavedPipeline.pipeline_link
				shared_pipelines.append({'doc_id':doc_id, 'pipeline_name': pipeline_name, 'pipeline_link': pipeline_link})

	return shared_pipelines


#get all the other user details, except this user
def getAllUsersDetails(thisUserEmail):
	all_user_details = []
	for row in (views_by_email(g.couch)):
		doc_id = row.value
		thisUser = P2IRC_User.load(doc_id)

		#do not add this user to the list
		if thisUser.email != thisUserEmail:
			userName = thisUser.first_name + " " +thisUser.last_name
			userEmail = thisUser.email
			userRole = thisUser.user_role

			#append this user to the list
			all_user_details.append({'userName':userName, 'userEmail': userEmail, 'userRole':userRole})

	return all_user_details


import html
@app.route('/cvs')
def cvs():
	module = ''
	for row in views_by_pipeline_module(g.couch):
		if row.key == 'rgb2gray':
			module = PipelineModule.load(row.value)

	moduleSourceCode_main = getModuleCodes(module.code_link_main)
	moduleSourceCode_settings = getModuleCodes(module.code_link_settings)
	moduleSourceCode_html = getModuleCodes(module.code_link_html)

	#load user details...
	row = (views_by_email(g.couch))[session.get('p2irc_user_email')]
	p2irc_user = P2IRC_User.load(list(row)[0].value)
	first_name = p2irc_user.first_name
	last_name = p2irc_user.last_name
	email = p2irc_user.email
	user_role = p2irc_user.user_role
	#store the user role in session
	session['user_role'] = user_role

	#get the list of all saved pipelines from DB
	saved_pipelines = getSavedPipelines(session.get('p2irc_user_email'))
	#get the list of all shared pipelines with this user from DB
	shared_pipelines = getSharedPipelines(session.get('p2irc_user_email'))
	#get all other user details
	all_other_users = getAllUsersDetails(session.get('p2irc_user_email'))







	return render_template('cloud_vision_pipeline_save.html', 
	module_name = module.module_name,
	documentation = module.documentation,
	moduleSourceCode_settings = moduleSourceCode_settings,
	moduleSourceCode_main = moduleSourceCode_main,
	moduleSourceCode_html = html.unescape(moduleSourceCode_html),
	first_name = first_name,
	last_name = last_name,
	email = email,
	user_role = user_role,
	saved_pipelines = saved_pipelines,
	shared_pipelines = shared_pipelines,
    all_other_users=all_other_users)









@app.route('/cvs_module_locking')
def cvs_module_locking():
	module = ''
	for row in views_by_pipeline_module(g.couch):
		if row.key == 'rgb2gray':
			module = PipelineModule.load(row.value)

	moduleSourceCode_main = getModuleCodes(module.code_link_main)
	moduleSourceCode_settings = getModuleCodes(module.code_link_settings)
	moduleSourceCode_html = getModuleCodes(module.code_link_html)

	#load user details...
	row = (views_by_email(g.couch))[session.get('p2irc_user_email')]
	p2irc_user = P2IRC_User.load(list(row)[0].value)
	first_name = p2irc_user.first_name
	last_name = p2irc_user.last_name
	email = p2irc_user.email
	user_role = p2irc_user.user_role
	#store the user role in session
	session['user_role'] = user_role

	#get the list of all saved pipelines from DB
	saved_pipelines = getSavedPipelines(session.get('p2irc_user_email'))
	#get the list of all shared pipelines with this user from DB
	shared_pipelines = getSharedPipelines(session.get('p2irc_user_email'))
	#get all other user details
	all_other_users = getAllUsersDetails(session.get('p2irc_user_email'))







	return render_template('cloud_vision_pipeline_save_module_locking.html',
	module_name = module.module_name,
	documentation = module.documentation,
	moduleSourceCode_settings = moduleSourceCode_settings,
	moduleSourceCode_main = moduleSourceCode_main,
	moduleSourceCode_html = html.unescape(moduleSourceCode_html),
	first_name = first_name,
	last_name = last_name,
	email = email,
	user_role = user_role,
	saved_pipelines = saved_pipelines,
	shared_pipelines = shared_pipelines,
    all_other_users=all_other_users)










@app.route('/cvs_atrr_level_locking')
def cvs_atrr_level_locking():
	module = ''
	for row in views_by_pipeline_module(g.couch):
		if row.key == 'rgb2gray':
			module = PipelineModule.load(row.value)

	moduleSourceCode_main = getModuleCodes(module.code_link_main)
	moduleSourceCode_settings = getModuleCodes(module.code_link_settings)
	moduleSourceCode_html = getModuleCodes(module.code_link_html)

	#load user details...
	row = (views_by_email(g.couch))[session.get('p2irc_user_email')]
	p2irc_user = P2IRC_User.load(list(row)[0].value)
	first_name = p2irc_user.first_name
	last_name = p2irc_user.last_name
	email = p2irc_user.email
	user_role = p2irc_user.user_role
	#store the user role in session
	session['user_role'] = user_role

	#get the list of all saved pipelines from DB
	saved_pipelines = getSavedPipelines(session.get('p2irc_user_email'))
	#get the list of all shared pipelines with this user from DB
	shared_pipelines = getSharedPipelines(session.get('p2irc_user_email'))
	#get all other user details
	all_other_users = getAllUsersDetails(session.get('p2irc_user_email'))







	return render_template('cloud_vision_pipeline_save_attr_level_locking.html',
	module_name = module.module_name,
	documentation = module.documentation,
	moduleSourceCode_settings = moduleSourceCode_settings,
	moduleSourceCode_main = moduleSourceCode_main,
	moduleSourceCode_html = html.unescape(moduleSourceCode_html),
	first_name = first_name,
	last_name = last_name,
	email = email,
	user_role = user_role,
	saved_pipelines = saved_pipelines,
	shared_pipelines = shared_pipelines,
    all_other_users=all_other_users)





















@app.route('/webrtctest')
def webrtctest():
	return render_template('webrtctest.html')


@app.route('/get_module_details',  methods=['POST'])
def get_module_details():
	p_module_key = request.form['p_module_key']
	module = ''
	for row in views_by_pipeline_module(g.couch):
		if row.key == p_module_key: #'rgb2gray'
			module = PipelineModule.load(row.value)

	moduleSourceCode_main = getModuleCodes(module.code_link_main)
	moduleSourceCode_settings = getModuleCodes(module.code_link_settings)
	moduleSourceCode_html = getModuleCodes(module.code_link_html)

	
	return jsonify({ 'module_name':module.module_name,
	'documentation': module.documentation, 
	'moduleSourceCode_settings': moduleSourceCode_settings,
	'moduleSourceCode_main': moduleSourceCode_main,
	'moduleSourceCode_html': moduleSourceCode_html,
	'user_role': session.get('user_role') })

@app.route('/save_pipeline/',  methods=['POST'])
def save_pipeline():
	program = request.form['textarea_source_code']
	pipeline_name = request.form['pipelineName']


	#save the pipeline to file system
	f = open('pipeline_saved/'+pipeline_name, 'w')
	f.write(program)
	f.close()

	#save piepline information to database
	saved_pipeline = SavedPipeline()
	saved_pipeline.pipeline_name = pipeline_name
	saved_pipeline.author = session.get('p2irc_user_email')
	saved_pipeline.pipeline_link = 'pipeline_saved/'+pipeline_name

	saved_pipeline.store()
	
	return jsonify({'success': 1})


#Login and Sign Ups
@app.route('/p2irc')
def p2irc():
	return render_template('login.html')


@app.route('/p2irc_signup/',  methods=['POST'])
def p2irc_signup():
	first_name = request.form['first_name']
	last_name = request.form['last_name']
	email = request.form['email']
	password = request.form['password']


	p2irc_usr = P2IRC_User()
	p2irc_usr.first_name = first_name
	p2irc_usr.last_name = last_name 
	p2irc_usr.email = email
	p2irc_usr.password = password

	p2irc_usr.store()

	return jsonify({'success': 1})


@app.route('/p2irc_login/',  methods=['POST'])
def p2irc_login():
	email = request.form['email']
	password = request.form['password']

	row = (views_by_email(g.couch))[email]


	p2irc_user = ''
	if not row :
		return redirect(url_for('p2irc'))
	else:
		p2irc_user = P2IRC_User.load(list(row)[0].value)

	if p2irc_user.email != email or p2irc_user.password != password:
		return redirect(url_for('p2irc'))
	else:
		#first_name = p2irc_user.first_name
		#last_name = p2irc_user.last_name
		#email = p2irc_user.email
		session['p2irc_user_email'] = email
		#return redirect(url_for('cvs')) #turn based collaboration... uncomment for this feature
		#return redirect(url_for('cvs_module_locking')) #modular locking based collaboration... uncomment for this feature
		return redirect(url_for('cvs_atrr_level_locking')) #attr level locking based collaboration... uncomment for this feature

	#if not row or list(row)[0].value != password:
	#	return redirect(url_for('p2irc'))
	#else:
	#	return redirect(url_for('cvs'))
	
################## PIPELINE SAVING ENDS HERE ##############################
###########################################################################






@app.route('/ccv')
def ccv():
	#c =  CodeClones()
	#c.username = "A new User"
	#c.password = "A new Password"
	#c.store()

	#entry = CodeClones.load('d7dd92d4391d6ddbec202f75a60089f9')
	#entry.password = 'yay... password edited....'
	#entry.store()

	#sources = []
	#for row in views_by_user(g.couch):
	#	sources.append(row.value)
	#sources = list(sources)

    #document = views_by_user(g.couch)
 #   with open("code.java", "r") as f:
#	     content = f.read()
	#views_by_non_validated_clones

	sources = []
	for row in views_by_non_validated_clones(g.couch):
		sources.append(row.key)
	sources = list(sources)



	doc_length = len(sources)#checking if there is any further clone available or not to validate

	#No un-validated clone docs available
	if(doc_length == 0):
		#set some value representing end of clone validation docs.
		doc_id = 'NA'
		neural_net_response = 'NA'
		svm_response = 'NA'

		codeFragment_1 = 'No more clones available for validation.'
		codeFragment_2 = 'No more clones available for validation.'

	else:
		#p = str(CodeClones.load(sources[0]).fragment_2.path).strip('"')
		clone_doc = CodeClones.load(sources[0])
		doc_id = clone_doc.id

		"""
		fragment_1_code = ''
		with open(str(CodeClones.load(sources[0]).fragment_1.path).strip('"'), "r") as text_file:
			for line in itertools.islice(text_file, int(clone_doc.fragment_1.start_line), int(clone_doc.fragment_1.end_line)):
				#lines.append(line)
				fragment_1_code = fragment_1_code + line


		fragment_2_code = ''
		with open(p, "r") as text_file:
			for line in itertools.islice(text_file, int(clone_doc.fragment_2.start_line), int(clone_doc.fragment_2.end_line)):
				#lines.append(line)
				fragment_2_code = fragment_2_code + line
		""" 
		codeFragment_1 = getCodeFragment(clone_doc.fragment_1.path, clone_doc.fragment_1.start_line, clone_doc.fragment_1.end_line)
		codeFragment_2 = getCodeFragment(clone_doc.fragment_2.path, clone_doc.fragment_2.start_line, clone_doc.fragment_2.end_line)
	
		neural_net_response = ''
		svm_response = ''
		for response in clone_doc.auto_validation_result:
			if response['algorithm'] == 'Neural Network':
				neural_net_response = response['result'];
			if response['algorithm'] == 'SVM':
				svm_response = response['result'];


	return render_template('codeclone_validation.html', 
	codeFragment_1=codeFragment_1, 
	codeFragment_2=codeFragment_2,
	neural_net_response = neural_net_response,
	svm_response = svm_response,
	doc_id=doc_id)




@app.route('/get_next_code_fragments_for_validation',  methods=['POST'])
def get_next_code_fragments_for_validation():
	prev_doc_id = request.form['doc_id']
	user_response = request.form['user_response']

	clone_doc = CodeClones.load(prev_doc_id)
	clone_doc.is_validated_by_any_user = "yes"
	clone_doc.user_validation_result.append(user='golammostaeen', result=user_response)
	clone_doc.store()




	#cd = CodeClones.load('bf54d49f8654f0653c85a9cd2f011ab0')

	sources = []
	for row in views_by_non_validated_clones(g.couch):
		sources.append(row.key)
	sources = list(sources)

	doc_length = len(sources)#checking if there is any further clone available or not to validate

	#No un-validated clone docs available
	if(doc_length == 0):
		#set some value representing end of clone validation docs.
		doc_id = 'NA'
		neural_net_response = 'NA'
		svm_response = 'NA'

		codeFragment_1 = 'No more clones available for validation.'
		codeFragment_2 = 'No more clones available for validation.'
	
	else:
		cd = CodeClones.load(sources[0])


		doc_id = cd.id
		codeFragment_1 = getCodeFragment(cd.fragment_1.path, cd.fragment_1.start_line,cd.fragment_1.end_line)
		codeFragment_2 = getCodeFragment(cd.fragment_2.path, cd.fragment_2.start_line,cd.fragment_2.end_line)

		neural_net_response = ''
		svm_response = ''
		for response in clone_doc.auto_validation_result:
			if response['algorithm'] == 'Neural Network':
				neural_net_response = response['result'];
			if response['algorithm'] == 'SVM':
				svm_response = response['result'];
	

	



	return jsonify({ 'doc_id':doc_id,
	'codeFragment_1': codeFragment_1, 
	'codeFragment_2': codeFragment_2,
	'neural_net_response':neural_net_response,
	'svm_response': svm_response })








@app.route('/codeclone_stats')
def codeclone_stats():
    #return 'hello'
    return render_template('codeclone_stats.html')


########CODE CLONE VALIDATION ENDS



@app.route('/todo/api/v1.0/tasks', methods=['POST'])
def create_task():
   # if not request.json or not 'title' in request.json:
    #    abort(400)
    task = {
        'id': tasks[-1]['id'] + 1,
        'title': request.json['title'],
        'description': request.json.get('description', ""),
        'done': False
    }
    tasks.append(task)
    return jsonify({'task': task}), 201


@app.route('/get_image/median_filter/<int:disksize>',  methods=['GET'])
def get_image(disksize):
    #if request.args.get('type') == '1':
    image = data.coins()
    image = median(image, disk(disksize))
    skimage.io.imsave('test.png', image)
    filename = 'test.png'
      #else:
    #   filename = 'canola.png'
    return send_file(filename, mimetype='image/gif')



@app.route('/get_image/remove_noise/<float:disksize>',  methods=['GET'])
def get_image2(disksize):
    #astro = img_as_float(data.coins())
    astro = img_as_float(data.coins())
    #astro = astro[220:500, 220:500]
    noisy = astro + 0.6 * astro.std() * np.random.random(astro.shape)
    noisy = np.clip(noisy, 0, 1)
    noisy = denoise_tv_chambolle(noisy, weight=disksize, multichannel=True)

    #if request.args.get('type') == '1':
    #image = data.coins()
    #image = median(image, disk(disksize))
    skimage.io.imsave('test_noise.png', noisy)
    filename = 'test_noise.png'
      #else:
    #   filename = 'canola.png'
    return send_file(filename, mimetype='image/gif')


@app.route('/get_image/remove_noise_link/',  methods=['GET'])
def get_image10():

    noisy = denoise_tv_chambolle(io.imread(request.args.get('link')), weight=float(request.args.get('weight')), multichannel=True)


    skimage.io.imsave('test_noise.png', noisy)
    filename = 'test_noise.png'

    return send_file(filename, mimetype='image/gif')




@app.route('/get_image/swirl/',  methods=['GET'])
def get_image11():

    #noisy = denoise_tv_chambolle(io.imread(request.args.get('link')), weight=float(request.args.get('weight')), multichannel=True)
    swirled = swirl(io.imread(request.args.get('link')), rotation=0, strength=10, radius=500, order=4)
    skimage.io.imsave('test_noise.png', swirled)
    filename = 'test_noise.png'

    return send_file(filename, mimetype='image/gif')





@app.route('/get_image/rgblink/<path:url>',  methods=['GET'])
def get_image8(url):
    img = io.imread(url)
    img_gray = rgb2gray(img)
    skimage.io.imsave('static/images/test_rgb_grayCLOUD.png', img_gray)
    filename = 'test_rgb_gray.png'
    #return send_file(filename, mimetype='image/gif')
    return jsonify({'allTasks': tasks})


@app.route('/get_image/rgb_2_gray',  methods=['GET'])
def get_image3():
    img = io.imread('canola.png')
    img_gray = rgb2gray(img)
    skimage.io.imsave('test_rgb_gray.png', img_gray)
    filename = 'test_rgb_gray.png'
    return send_file(filename, mimetype='image/gif')


@app.route('/get_image/rgb',  methods=['GET'])
def get_image4():
    #img = io.imread('canola.png')
    #img_gray = rgb2gray(img)
    #skimage.io.imsave('test_rgb_gray.png', img)
    filename = 'canola.png'
    return send_file(filename, mimetype='image/gif')


#Send all the tasks
@app.route('/todo/api/v1.0/tasks', methods=['GET'])
def get_tasks():
    return jsonify({'allTasks': tasks})




#Send a particular task only
@app.route('/todo/api/v1.0/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = [task for task in tasks if task['id'] == task_id]
    if len(task) == 0:
        abort(404)
    return jsonify({'task': task[0]})


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)




@app.route('/chat')
def chat():
    #return 'hello'
    return render_template('testtemp.html')


if __name__ == "__main__":
	#socketio.run(app)
	app.run()

