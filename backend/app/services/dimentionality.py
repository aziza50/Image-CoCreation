from sklearn.decomposition import PCA
import numpy as np


class PCA_DimensionalityReducer:
    def __init__(self, n_components):
        self.n_components = n_components
        self.pca = PCA(n_components=n_components)
    
    def fit_transform(self, X):
        return self.pca.fit_transform(X)
    
    def transform(self, X):
        #X is the feature vector output from resnet, which is (2048,)
        #PCA expects a 2D array so (1,2048)
        X = X.reshape(1,-1)
        #PCA outputs a shape of (1,n_components)
        return self.pca.transform(X).squeeze()