'''
All I will do now is just load a pca (which has been fitted to the wikiart embeddings).
and transform the embeddings of the users image.
'''
import joblib
path = "app/embeddings/pca_art.pkl"

class PCA_DimensionalityReducer:
    def __init__(self):
        with open(path, 'rb') as file:
            self.pca = joblib.load(file)
            
    def transform(self, X):
        return self.pca.transform(X).astype("float32")