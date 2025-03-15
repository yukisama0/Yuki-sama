from TTS.api import TTS

# TTS initialisieren
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False)

# Text zu Sprache
tts.tts_to_file(text="Hallo, ich bin Yuki!", file_path="output.wav")
