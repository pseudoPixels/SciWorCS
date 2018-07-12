



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
	cent_df,corr_graph = find_centrality(w_corr_df,cent_type) #find the centrality
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