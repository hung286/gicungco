import glob, re

urls = set()
for f in glob.glob(r'C:\Users\Admin\.gemini\antigravity\brain\**\transcript.jsonl', recursive=True):
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            txt = fp.read()
            for u in re.findall(r'https?://[^\s"\'<>]+', txt):
                if 'toan-markdown' in u or 'localhost' in u or 'vercel' in u or '5173' in u:
                    urls.add(u)
    except:
        pass

for u in sorted(urls)[:15]:
    print(u)
