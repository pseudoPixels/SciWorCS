#!/usr/bin/env python
from __future__ import print_function
import sys
import cv2

import os



def __main__():
	image_location = sys.argv[1]

	img = cv2.imread(image_location)
	img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
	#print("Image Conversion Done!! INPUTP:: " + sys.argv[2] + " OUTPUT:: " + sys.argv[1])
	cv2.imwrite(sys.argv[2]+".png", img)
	os.rename(sys.argv[2]+".png", sys.argv[2])


if __name__ == "__main__":
	__main__()

