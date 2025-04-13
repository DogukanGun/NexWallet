import os


def get_dummy_voice_bytes():
    # Create a small dummy audio content
    dummy_content = b'\x52\x49\x46\x46\x24\x08\x00\x00\x57\x41\x56\x45'  # WAV file header
    dummy_content += os.urandom(1000)  # Random audio data
    return dummy_content