import pyautogui

def click_position(x, y):
    pyautogui.click(x, y)

def log(message):
    print(f"[LOG] {message}")
