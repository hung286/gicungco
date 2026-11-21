"""
Backend FastAPI cho Baidu Unlimited-OCR (https://github.com/baidu/Unlimited-OCR)
Chạy được trên máy có GPU NVIDIA (>= 8GB VRAM) hoặc Google Colab / Kaggle GPU.

Cài đặt:
    pip install fastapi uvicorn torch transformers pillow accelerate

Chạy server:
    python scripts/unlimited_ocr_server.py --port 8000
"""

import argparse
import base64
import io
import os
import tempfile
from typing import List, Optional

import torch
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

MODEL_ID = os.environ.get("UNLIMITED_OCR_MODEL", "baidu/Unlimited-OCR")

app = FastAPI(title="Baidu Unlimited-OCR Backend for MHEdu", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None
_tokenizer = None


def get_model():
    global _model, _tokenizer
    if _model is None:
        from transformers import AutoModel, AutoTokenizer

        print(f"[Unlimited-OCR] Loading {MODEL_ID} ...")
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
        dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
        _model = AutoModel.from_pretrained(
            MODEL_ID,
            torch_dtype=dtype,
            trust_remote_code=True,
        )
        if torch.cuda.is_available():
            _model = _model.cuda()
        _model = _model.eval()
        print("[Unlimited-OCR] Model ready!")
    return _model, _tokenizer


class ParseRequest(BaseModel):
    images: List[str]
    prompt: Optional[str] = (
        "Transcribe this document into structured Markdown with LaTeX math formulas "
        "($...$ for inline, $$...$$ for display) and Markdown tables."
    )
    sliding_window: int = 128
    max_tokens: int = 8192
    model: Optional[str] = None


def decode_data_url_to_pil(data_url: str) -> Image.Image:
    raw = data_url.split(",", 1)[1] if "," in data_url else data_url
    img_bytes = base64.b64decode(raw)
    return Image.open(io.BytesIO(img_bytes)).convert("RGB")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "cuda_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "loaded": _model is not None,
    }


@app.post("/parse")
def parse_document(req: ParseRequest):
    if not req.images:
        raise HTTPException(status_code=400, detail="No images provided.")

    model, tokenizer = get_model()
    temp_paths: List[str] = []
    try:
        for idx, data_url in enumerate(req.images):
            img = decode_data_url_to_pil(data_url)
            fd, path = tempfile.mkstemp(prefix=f"uocr_p{idx}_", suffix=".png")
            os.close(fd)
            img.save(path, format="PNG")
            temp_paths.append(path)

        if hasattr(model, "parse_document"):
            markdown = model.parse_document(
                image_paths=temp_paths,
                prompt=req.prompt,
                sliding_window=req.sliding_window,
            )
        elif hasattr(model, "infer"):
            parts = []
            for p in temp_paths:
                out = model.infer(
                    tokenizer,
                    prompt=f"<image>\n{req.prompt}",
                    image_file=p,
                    save_results=False,
                )
                parts.append(str(out or "").strip())
            markdown = "\n\n".join(parts)
        else:
            raise RuntimeError(
                "Loaded model does not expose parse_document/infer. "
                "Khuyên dùng vLLM: vllm serve baidu/Unlimited-OCR --trust-remote-code"
            )

        return {
            "ok": True,
            "model": MODEL_ID,
            "pages": len(temp_paths),
            "markdown": str(markdown or "").strip(),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        for p in temp_paths:
            try:
                os.remove(p)
            except OSError:
                pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    uvicorn.run(app, host=args.host, port=args.port)
