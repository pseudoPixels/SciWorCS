#!/usr/bin/env python
from __future__ import print_function
import sys
import cv2

import os



def __main__():
	image_location = sys.argv[1]

	img = cv2.imread(image_location)
	hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
	h, s, v = cv2.split(hsv)

	if sys.argv[3] == 'h':
		cv2.imwrite(sys.argv[2]+".png", h)
	elif sys.argv[3] == 's':
		cv2.imwrite(sys.argv[2]+".png", s)
	elif sys.argv[3] == 'v':
		cv2.imwrite(sys.argv[2]+".png", v)

	
	#cv2.imwrite(sys.argv[2]+".png", img)
	os.rename(sys.argv[2]+".png", sys.argv[2])


if __name__ == "__main__":
	__main__()

