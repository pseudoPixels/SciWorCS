







import logging
import multiprocessing as mp
from multiprocessing import Process, Value, Queue
import re
import os, platform
import collections
import tarfile
import sys
import hashlib
import datetime as dt
import zipfile

experimental = False



def tokenize_files(file_string, comment_inline_pattern, comment_open_close_pattern, separators):
	h_time = dt.datetime.now()
	m = hashlib.md5()
	m.update(file_string.encode('utf-8'))
	file_hash = m.hexdigest()
	hash_time = (dt.datetime.now() - h_time).microseconds

	lines = file_string.count('\n')
	if not file_string.endswith('\n'):
		lines += 1
	file_string = "".join([s for s in file_string.splitlines(True) if s.strip()])

	LOC = file_string.count('\n')
	if not file_string.endswith('\n'):
		LOC += 1

	re_time = dt.datetime.now()
	# Remove tagged comments
	file_string = re.sub(comment_open_close_pattern, '', file_string, flags=re.DOTALL)
	# Remove end of line comments
	file_string = re.sub(comment_inline_pattern, '', file_string, flags=re.MULTILINE)
	re_time = (dt.datetime.now() - re_time).microseconds

	file_string = "".join([s for s in file_string.splitlines(True) if s.strip()]).strip()

	SLOC = file_string.count('\n')
	if file_string != '' and not file_string.endswith('\n'):
		SLOC += 1

	final_stats = (file_hash, lines, LOC, SLOC)

	# Rather a copy of the file string here for tokenization
	file_string_for_tokenization = file_string

	temp_string = file_string_for_tokenization.split('\n')
	if experimental:
		for line in temp_string:
			if ('=' in line) and ('==' not in line):
				assignments_count += 1

	# Transform separators into spaces (remove them)
	s_time = dt.datetime.now()
	for x in separators:
		if experimental:
			separators_count += file_string_for_tokenization.count(x)
		file_string_for_tokenization = file_string_for_tokenization.replace(x, ' ')
	s_time = (dt.datetime.now() - s_time).microseconds

	##Create a list of tokens
	file_string_for_tokenization = file_string_for_tokenization.split()
	## Total number of tokens
	tokens_count_total = len(file_string_for_tokenization)
	##Count occurrences
	file_string_for_tokenization = collections.Counter(file_string_for_tokenization)
	##Converting Counter to dict because according to StackOverflow is better
	file_string_for_tokenization = dict(file_string_for_tokenization)
	## Unique number of tokens
	tokens_count_unique = len(file_string_for_tokenization)

	t_time = dt.datetime.now()
	# SourcererCC formatting
	tokens = ','.join(['{}@@::@@{}'.format(k.encode('utf-8'), v)
					   for k, v in file_string_for_tokenization.items()])
	t_time = (dt.datetime.now() - t_time).microseconds

	# MD5
	h_time = dt.datetime.now()
	m = hashlib.md5()
	m.update(tokens.encode('utf-8'))
	hash_time += (dt.datetime.now() - h_time).microseconds

	if experimental:
		new_experimental_values = '%s,%s,%s,%s' % (separators_count, assignments_count, statements_count,
												   expressions_count)  # String must go formatted to files_tokens
		final_tokens = (tokens_count_total, tokens_count_unique, new_experimental_values, m.hexdigest(), '@#@' + tokens)
	else:
		final_tokens = (tokens_count_total, tokens_count_unique, m.hexdigest(), '@#@' + tokens)

	#write out this module Output
	with open(output_tokens, "w+") as thisModuleOutput:
		thisModuleOutput.write(str(final_tokens))
	#return (final_stats, final_tokens)
	return 0


separators = [';', '.', '[', ']', '(', ')', '~', '!', '-', '+', '&', '*', '/', '%', '<', '>', '&', '^', '|', '?', '{',
			  '}', '=', '#', ',', '"', '\\', ':', '$', "'"]
comment_inline = re.escape('//')
comment_inline_pattern = comment_inline + '.*?$'
comment_open_tag = re.escape('/*')
# print comment_open_tag
comment_close_tag = re.escape('*/')
comment_open_close_pattern = comment_open_tag + '.*?' + comment_close_tag
file_extensions = '.java'

file_path = ''
with open(sourceFile) as module_1_inp:
	file_path = module_1_inp.readlines()
file_path = file_path[0]

file_string = ''
with open(file_path) as module_2_inp:
	file_string = module_2_inp.read()

tokenize_files(file_string, comment_inline_pattern, comment_open_close_pattern, separators)









