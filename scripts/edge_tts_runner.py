# -*- coding: utf-8 -*-
"""
Edge TTS Runner CLI for MHEdu SmartEdu TTS.
Generates MP3 audio from UTF-8 text using Microsoft Edge Neural TTS.
"""
import sys
import io
import os
import argparse
import asyncio
import edge_tts

VOICE_MAP = {
    'hoai-my': 'vi-VN-HoaiMyNeural',
    'hoaimy': 'vi-VN-HoaiMyNeural',
    'ms-hoaimy': 'vi-VN-HoaiMyNeural',
    'vi-vn-hoaimyneural': 'vi-VN-HoaiMyNeural',
    'nam-minh': 'vi-VN-NamMinhNeural',
    'namminh': 'vi-VN-NamMinhNeural',
    'ms-namminh': 'vi-VN-NamMinhNeural',
    'vi-vn-namminhneural': 'vi-VN-NamMinhNeural',
    'en-female': 'en-US-JennyNeural',
    'en-male': 'en-US-GuyNeural'
}

def format_rate(speed: float) -> str:
    try:
        pct = int(round((float(speed) - 1.0) * 100))
        if pct >= 0:
            return f"+{pct}%"
        return f"{pct}%"
    except Exception:
        return "+0%"

async def run_synthesis(text: str, voice: str, rate: str, out_file: str):
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(out_file)

def main():
    parser = argparse.ArgumentParser(description="Microsoft Edge TTS Synthesizer")
    parser.add_argument("--voice", default="vi-VN-HoaiMyNeural", help="Voice name or alias")
    parser.add_argument("--speed", type=float, default=1.0, help="Playback speed multiplier (e.g. 1.0, 1.1)")
    parser.add_argument("--output", required=True, help="Path to output mp3 file")
    parser.add_argument("--text", default="", help="Text to synthesize (or read from stdin)")
    parser.add_argument("--text-file", default="", help="Path to UTF-8 text file")
    args = parser.parse_args()

    text = ""
    if args.text_file and os.path.exists(args.text_file):
        with open(args.text_file, "r", encoding="utf-8") as f:
            text = f.read().strip()
    elif args.text:
        text = args.text.strip()
    else:
        text = sys.stdin.read().strip()

    if not text:
        sys.stderr.write("ERROR: No text provided.\n")
        sys.exit(1)

    voice_key = str(args.voice or "").strip().lower()
    voice = VOICE_MAP.get(voice_key, args.voice or "vi-VN-HoaiMyNeural")
    rate_str = format_rate(args.speed)

    try:
        asyncio.run(run_synthesis(text, voice, rate_str, args.output))
        if os.path.exists(args.output) and os.path.getsize(args.output) > 0:
            print(f"OK:{os.path.getsize(args.output)}")
            sys.exit(0)
        else:
            sys.stderr.write("ERROR: Output file empty or not generated.\n")
            sys.exit(2)
    except Exception as exc:
        sys.stderr.write(f"ERROR: {exc}\n")
        sys.exit(3)

if __name__ == "__main__":
    main()
