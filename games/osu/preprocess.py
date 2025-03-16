import cv2
import os

def preprocess_image(image_path):
    image = cv2.imread(image_path)
    resized = cv2.resize(image, (256, 256))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    return gray

def save_processed(image, save_path):
    cv2.imwrite(save_path, image)

# Beispielaufruf
image = preprocess_image("raw_image.png")
save_processed(image, "processed_image.png")
