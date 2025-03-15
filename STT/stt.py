import whisper
import sounddevice as sd
import numpy as np
import threading
import queue
import time
import torch
import sys
import tempfile
import wave

# Check for GPU availability, otherwise fallback to CPU
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Set the model to use Whisper small (for lower latency)
model = whisper.load_model("small").to(device)

# Create a queue for audio chunks
audio_queue = queue.Queue()

# Parameters
SAMPLERATE = 16000  # Whisper works with 16 kHz sample rate
CHANNELS = 1  # Mono audio
FRAMESIZE = 1024  # The size of each audio chunk
MAX_LATENCY = 2.0  # Max allowed lag in seconds before exit

# Time measurement
last_process_time = time.time()

# Function to record audio live
def record_audio():
    def callback(indata, frames, time, status):
        if status:
            print(status)
        audio_queue.put(indata.copy())
    
    with sd.InputStream(callback=callback, channels=CHANNELS, samplerate=SAMPLERATE, blocksize=FRAMESIZE):
        print("Recording...")
        while True:
            pass  # Keep recording forever

# Function to save audio as a temporary WAV file
def save_audio_as_wav(audio_chunk, filename):
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(2)  # 2 bytes per sample (16-bit)
        wf.setframerate(SAMPLERATE)
        wf.writeframes(audio_chunk)

# Function to transcribe audio and send back the result
def transcribe_audio():
    global last_process_time
    while True:
        audio_chunk = audio_queue.get()
        audio = np.mean(audio_chunk, axis=1)  # Convert to mono if needed
        audio = (audio * 32767).astype(np.int16)  # Convert to 16-bit PCM format
        
        # Save audio to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_wav:
            temp_wav_path = temp_wav.name
            save_audio_as_wav(audio.tobytes(), temp_wav_path)

            # Measure time before processing
            start_time = time.time()

            # Transcribe the audio
            result = model.transcribe(temp_wav_path)  # Pass the temporary WAV file to the model
            print(f"Transcription: {result['text']}")

            # Check time difference to detect lag
            processing_time = time.time() - start_time
            last_process_time = time.time()

            # Exit if processing time is too long (lag detection)
            if processing_time > MAX_LATENCY:
                print(f"Exiting due to lag (took {processing_time:.2f} seconds)")
                sys.exit()

# Start the recording and transcribing threads
threading.Thread(target=record_audio, daemon=True).start()
threading.Thread(target=transcribe_audio, daemon=True).start()

# Keep the script running
input("Press Enter to stop...\n")
