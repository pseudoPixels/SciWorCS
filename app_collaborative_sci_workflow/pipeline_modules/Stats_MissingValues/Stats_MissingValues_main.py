

import matplotlib
#matplotlib.use('Agg')
import numpy as np
import matplotlib.pyplot as plt
plt.switch_backend('agg')
import pandas as pd



import warnings
warnings.filterwarnings('ignore')



with open(csv_dataset_path) as module_1_inp:
	lines = module_1_inp.readlines()

#only read the first line (in case it has multiples)
csv_dataset_path = lines[0]

dataset = pd.read_csv(csv_dataset_path)




with open(missing_values, "w+") as thisModuleOutput:
    thisModuleOutput.write(str(dataset.isnull().sum()))


