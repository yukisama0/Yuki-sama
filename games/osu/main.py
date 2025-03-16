import cv2
import numpy as np
import mss
import time

screen_width, screen_height = mss.mss().monitors[1]['width'], mss.mss().monitors[1]['height']
fps = 120
pixel_resolution_width = 360
pixel_resolution_height = 180

alpha = 0.5  # Contrast control (1.0 - 3.0)
beta = 0      # Brightness control (0 - 100)

print("Recording started... Press Ctrl+C to stop.")

with mss.mss() as sct:
    try:
        while True:
            screenshot = sct.grab(sct.monitors[1])
            frame = np.array(screenshot)
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # Increase contrast
            contrast_frame = cv2.convertScaleAbs(gray_frame, alpha=alpha, beta=beta)

            # Create a pixelated effect
            pixelated_frame = cv2.resize(contrast_frame, (pixel_resolution_width, pixel_resolution_height), interpolation=cv2.INTER_LINEAR)
            resized_frame = cv2.resize(pixelated_frame, (screen_width, screen_height), interpolation=cv2.INTER_LINEAR)

            cv2.imshow("Live Screen Capture", resized_frame)
            if cv2.waitKey(int(1000 / fps)) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        print("\nRecording stopped.")
        cv2.destroyAllWindows()
