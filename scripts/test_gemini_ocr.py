import base64, json, urllib.request, os

api_key = 'AIzaSyAhMtUEk4ewaYBoiMJUZgQw2SPKQHPWrMI'
img1_path = r'C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795453117840_f0dd4813.jpg'
img2_path = r'C:/Users/Admin/.gemini/antigravity/brain/4760886b-87e8-409c-bd6e-4ff560c9dc96/.user_uploaded/media_1795453153802_ec899298.jpg'

b1 = base64.b64encode(open(img1_path, 'rb').read()).decode('utf-8')
b2 = base64.b64encode(open(img2_path, 'rb').read()).decode('utf-8')

with open('public/ai-tools/toan-markdown-docx/index.html', 'r', encoding='utf-8') as f:
    text = f.read()
    s_idx = text.find('SYSTEM_PROMPT = `') + len('SYSTEM_PROMPT = `')
    e_idx = text.find('`;', s_idx)
    system_prompt = text[s_idx:e_idx]

def call_gemini(parts, label):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {"temperature": 0.1}
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            out = "".join(p.get("text", "") for p in data.get("candidates", [{}])[0].get("content", {}).get("parts", []))
            print(f"=== {label} (length: {len(out)}) ===")
            print(out[:500])
            print("...")
            print(out[-300:])
            return out
    except Exception as e:
        print(f"Error {label}:", e)
        return ""

# Test Page 2 alone (to see why questions are missing!)
parts_p2 = [
    {"text": "--- TRANG 1: Trang 2 (ec899298.jpg) ---"},
    {"inlineData": {"mimeType": "image/jpeg", "data": b2}},
    {"text": "Hãy trích xuất và chuyển đổi toàn bộ nội dung tài liệu/đề thi (bao gồm đầy đủ câu hỏi, công thức LaTeX, các bước thí nghiệm, các ý Đúng/Sai a-d hoặc A-D, và MỌI sơ đồ thí nghiệm/thiết bị thực tế/hình vẽ/đồ thị/bảng biến thiên) trong các trang tài liệu đính kèm sang định dạng Markdown chuẩn."}
]

out2 = call_gemini(parts_p2, "PAGE 2 ALONE")
with open("scripts/out_page2.md", "w", encoding="utf-8") as f:
    f.write(out2)
