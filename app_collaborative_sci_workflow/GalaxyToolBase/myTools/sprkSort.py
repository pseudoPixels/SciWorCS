#!/usr/bin/env python
from __future__ import print_function
import sys
import cv2



import os
import sys



import findspark
findspark.init()



from pyspark.sql import SparkSession
from pyspark.context import SparkContext
from pyspark import SparkConf



def __main__():
	sc = SparkContext.getOrCreate()

	sc.setLogLevel('OFF')

        text_file = sc.textFile(sys.argv[1])
        sortedCount = text_file.flatMap(lambda x: x.split(" ")).map(lambda x: (int(x), 1)).sortByKey()
        output = sortedCount.collect()

        with open(sys.argv[2], 'w') as f: 
    	   for(num, unitcount) in output:
		f.write(str(num)+"\n")

	#os.rename(sys.argv[2]+".txt", sys.argv[2])


if __name__ == "__main__":
	__main__()

