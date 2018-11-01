#!/usr/bin/env python
from __future__ import print_function
import sys
import cv2

import os



def __main__():
	image_location = sys.argv[1]
	image_location2 = sys.argv[2]

	img = cv2.imread(image_location)
	ret,img = cv2.threshold(img,int(sys.argv[3]),255,cv2.THRESH_BINARY)
	
	cv2.imwrite(sys.argv[2]+".png", img)
	os.rename(sys.argv[2]+".png", sys.argv[2])


if __name__ == "__main__":
	__main__()

