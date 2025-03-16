import cv2
import numpy as np
import mss
import win32gui

def capture_window(window_title="osu!"):
    hwnd = win32gui.FindWindow(None, window_title)
    if hwnd:
        rect = win32gui.GetWindowRect(hwnd)
        x, y, w, h = rect
        with mss.mss() as sct:
            bbox = {'left': x, 'top': y, 'width': w - x, 'height': h - y}
            frame = np.array(sct.grab(bbox))
            return cv2.cvtColor(frame, cv2.COLOR_BGRA2RGB)
    return None
