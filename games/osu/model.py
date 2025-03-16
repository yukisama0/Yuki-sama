import torch
import torchvision.transforms as transforms

def load_model():
    model = torch.load("model.pth")
    model.eval()
    return model

def predict(model, frame):
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Resize((256, 256)),
    ])
    tensor = transform(frame).unsqueeze(0)
    with torch.no_grad():
        output = model(tensor)
    x, y = output[0].numpy()
    return int(x), int(y)
