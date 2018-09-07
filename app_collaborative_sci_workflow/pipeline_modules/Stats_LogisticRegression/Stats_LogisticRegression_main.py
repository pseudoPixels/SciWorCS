

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

# import pip
# r = pip.main(['install', 'scikit-learn'])
#
# print ("=================================")
# print (r)
# print ("=================================")



# Fitting Logistic Regression to the Training set
from sklearn.linear_model import LogisticRegression
classifier = LogisticRegression(penalty='l2',random_state = 0)


cols = ["Age","Fare"]
X = dataset[cols]
y = dataset['Survived']



# Applying k-Fold Cross Validation
from sklearn.model_selection import cross_val_score
accuracies = cross_val_score(estimator = classifier, X=X , y=y , cv = 10)


with open(logisticRegression_classification_stats, "w+") as thisModuleOutput:
    thisModuleOutput.write("Logistic Regression:\n Accuracy:" + str( accuracies.mean() ) +  "+/-" + str(accuracies.std())  + "\n")


#print("Logistic Regression:\n Accuracy:", accuracies.mean(), "+/-", accuracies.std(),"\n")





