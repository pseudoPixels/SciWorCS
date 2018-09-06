

import matplotlib
#matplotlib.use('Agg')
import numpy as np
import matplotlib.pyplot as plt
plt.switch_backend('agg')
import pandas as pd



import warnings
warnings.filterwarnings('ignore')


dataset = pd.read_csv(inputDataset)

dataset.to_csv(loaded_dataset)

