import couchdb
import cv2
import numpy as np


class imgSearch:

    def __init__(self):
        server = couchdb.Server()
        self.db = server['img_storage']

    def search(self, filename):
        # store matched img path
        matchedimages = []
        cv2.ocl.setUseOpenCL(False)
        img1 = cv2.imread(filename, 0)
        # Initiate SIFT detector
        orb = cv2.ORB_create()
        # find the keypoints and descriptors with SIFT
        kp1, des1 = orb.detectAndCompute(img1, None)
        results = self.db.query('function(doc){emit(doc.img_uri,doc);}')
        # yar = des1.tolist()
        yar = np.array(des1)
        for doc in results:
            feature_str = doc.value["img_feature"]
            # feature_str=feature_str.replace(".","")
            # feature_str=feature_str.replace(",","")
            # print(feature_str)
            loaded_features = eval(feature_str)

            # print(doc.value["img_uri"])
            img2 = cv2.imread(doc.value["img_uri"], 0)  # trainImage
            kp2, des2 = orb.detectAndCompute(img2, None)
            # des2 = np.asarray(loaded_features)
            # print(des2)
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            # Match descriptors.
            matches = bf.match(des1, des2)

            if len(matches) > 230:
                # print("Number matches: ")
                matchedimages.append(doc.value["img_uri"])
        return matchedimages

if __name__ == '__main__':
    test = imgSearch()
    result = test.search("E:\Webpage\Plant Phenotype data\Plant Phenotype data\A1\plant001_label.png")
