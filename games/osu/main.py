from capture import capture_window
from model import load_model, predict
from utils import click_position

model = load_model()

while True:
    frame = capture_window("osu!")
    if frame is not None:
        x, y = predict(model, frame)
        click_position(x, y)
