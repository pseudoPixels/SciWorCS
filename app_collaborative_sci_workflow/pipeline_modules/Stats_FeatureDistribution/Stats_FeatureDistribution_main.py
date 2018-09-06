

import matplotlib
#matplotlib.use('Agg')
import numpy as np
import matplotlib.pyplot as plt
plt.switch_backend('agg')
import pandas as pd



import warnings
warnings.filterwarnings('ignore')



# with open(csv_dataset_path) as module_1_inp:
# 	lines = module_1_inp.readlines()
#
# #only read the first line (in case it has multiples)
# csv_dataset_path = lines[0]

dataset = pd.read_csv(csv_dataset_path)

survived_class = dataset[dataset['Survived']==1][feature].value_counts()
dead_class = dataset[dataset['Survived']==0][feature].value_counts()
df_class = pd.DataFrame([survived_class,dead_class])
df_class.index = ['Survived','Died']


tmpFileName = feature_categories_by_lables.split('/')
tmpFileName = tmpFileName[len(tmpFileName)-1]

tmpFilePath = "/home/ubuntu/Webpage/app_collaborative_sci_workflow/static/img/" + tmpFileName + ".png"

df_class.plot(kind='bar',stacked=True, figsize=(6,6), title="Survived/Died by Class").get_figure().savefig(tmpFilePath)



with open(feature_categories_by_lables, "w+") as thisModuleOutput:
    thisModuleOutput.write("<HTML><body>")
    thisModuleOutput.write("<img src='http://p2irc-cloud.usask.ca/app_collaborative_sci_workflow/static/img/" + tmpFileName + ".png'/>")
    thisModuleOutput.write("</body></HTML>")


#
# Class1_survived= df_class.iloc[0,0]/df_class.iloc[:,0].sum()*100
# Class2_survived = df_class.iloc[0,1]/df_class.iloc[:,1].sum()*100
# Class3_survived = df_class.iloc[0,2]/df_class.iloc[:,2].sum()*100
#
#
# with open(feature_categories_by_lables, "w+") as thisModuleOutput:
#     thisModuleOutput.write("Percentage of Class 1 that survived:" + str(round(Class1_survived)) + "%\n")
#     thisModuleOutput.write("Percentage of Class 2 that survived:" + str(round(Class2_survived)) + "%\n")
#     thisModuleOutput.write("Percentage of Class 3 that survived:" + str(round(Class3_survived)) + "%\n")