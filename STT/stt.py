import whisper
import pyaudio
import numpy as np
import time

model = whisper.load_model("medium")

CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
SILENCE_THRESHOLD = 500

p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)

print("Listening... Press Ctrl+C to stop.")
print("")

last_transcription = ""

def is_speech(audio_data):
    if len(audio_data) == 0:
        return False
    audio_array = np.frombuffer(audio_data, dtype=np.int16)
    if audio_array.size == 0:
        return False
    rms = np.mean(np.abs(audio_array))
    return rms > SILENCE_THRESHOLD

def transcribe_audio():
    global last_transcription
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
    audio_array = audio_array.astype(np.float32) / 32768.0

    result = model.transcribe(audio_array, language="de")

    if result["text"] != last_transcription:
        last_transcription = result["text"]
        print(result["text"])

try:
    while True:
        transcribe_audio()
except KeyboardInterrupt:
    print("\nRecording stopped.")
    stream.stop_stream()
    stream.close()
    p.terminate()
