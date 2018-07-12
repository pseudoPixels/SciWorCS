


num_to_pull = 1
corr_thresh = 0.4
min_count = 3
num_required = 50


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

print('Bio Data Cleaning Done Successfully...')