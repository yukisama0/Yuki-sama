import whisper
import pyaudio
import numpy as np
import webrtcvad
import noisereduce as nr

model = whisper.load_model("medium.en")

CHUNK = 320
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
SILENCE_THRESHOLD = 500

p = pyaudio.PyAudio()
stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)

vad = webrtcvad.Vad()
vad.set_mode(3)

print("Listening... Press Ctrl+C to stop.")
print("")

last_transcription = ""

def is_speech(data):
    audio_array = np.frombuffer(data, dtype=np.int16)
    if len(audio_array) != CHUNK:
        return False
    return vad.is_speech(audio_array.tobytes(), RATE)

try:
    while True:
        frames = []
        speech_detected = False

        while not speech_detected:
            data = stream.read(CHUNK)
            if is_speech(data):
                speech_detected = True
            frames.append(data)

        while speech_detected:
            data = stream.read(CHUNK)
            frames.append(data)
            if not is_speech(data):
                break

        audio_data = b''.join(frames)
        audio_array = np.frombuffer(audio_data, dtype=np.int16)
        reduced_noise = nr.reduce_noise(y=audio_array, sr=RATE)
        audio_array = reduced_noise.astype(np.float32) / 32768.0
        result = model.transcribe(audio_array, language="en")

        if result["text"] != last_transcription:
            last_transcription = result["text"]
            print(result["text"])

except KeyboardInterrupt:
    print("\nRecording stopped.")
    stream.stop_stream()
    stream.close()
    p.terminate()