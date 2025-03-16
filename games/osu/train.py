import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder
from torch.utils.data import DataLoader

class OsuNet(nn.Module):
    def __init__(self):
        super(OsuNet, self).__init__()
        self.fc = nn.Linear(256 * 256, 2)

    def forward(self, x):
        x = x.view(-1, 256 * 256)
        return self.fc(x)

dataset = ImageFolder("data/", transform=transforms.Compose([
    transforms.Grayscale(),
    transforms.ToTensor(),
    transforms.Resize((256, 256))
]))

loader = DataLoader(dataset, batch_size=32, shuffle=True)

model = OsuNet()
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(10):
    for images, labels in loader:
        outputs = model(images)
        loss = criterion(outputs, labels.float())
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch+1}, Loss: {loss.item()}")

torch.save(model, "model.pth")
