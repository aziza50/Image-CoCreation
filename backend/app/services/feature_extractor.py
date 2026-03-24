import torch
import torchvision.models as models
from torchvision import transforms
'''
For feature extraction, I will be using ResNet-50
'''

class FeatureExtractor(torch.nn.Module):
    def __init__(self):
        super(FeatureExtractor, self).__init__()
        self.resnet = models.resnet50(weights = models.ResNet50_Weights.DEFAULT)
        #I actually just want the features not classification
        self.resnet = torch.nn.Sequential(*list(self.resnet.children())[:-1])
        self.resnet.eval()
        self.transform = transforms.Compose([
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

    def forward(self, x):
        x = self.transform(x)
        #here transform outputs (3,224,224)
        with torch.no_grad():
            features = self.resnet(x)
            #resnet outputs a shape of (1,2048,1,1)
        #squeeze removes useless dimenstions so (2048,)
        return features.squeeze(-1).squeeze(-1).numpy() 
    
