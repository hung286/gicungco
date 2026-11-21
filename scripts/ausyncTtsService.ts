export interface TtsRequestParams {
  text: string;
  lang?: string;
  slow?: boolean;
  speed?: number;
  voice?: string; // 'thu-ha' | 'dang-khoa' | custom voice_id
  ausyncApiKey?: string;
  modelName?: string;
}

export interface TtsSynthesisResult {
  buffer: Buffer;
  contentType: string;
  ext: string;
  provider: 'ausynclab' | 'google-fallback';
  voiceUsed: string;
}

const AUSYNC_API_BASE = 'https://api.ausynclab.io/api/v1';

interface CachedVoices {
  fetchedAt: number;
  voices: Array<{ id: string; name: string; normName: string }>;
}

const voiceCacheByKey = new Map<string, CachedVoices>();

function stripVietnameseAccents(s: string): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export async function listAusyncVoices(apiKey: string) {
  const cleanKey = String(apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('Thiếu AusyncLab API Key (X-API-Key).');
  }

  const cached = voiceCacheByKey.get(cleanKey);
  if (cached && Date.now() - cached.fetchedAt < 10 * 60 * 1000) {
    return cached.voices;
  }

  const resp = await fetch(`${AUSYNC_API_BASE}/voices`, {
    method: 'GET',
    headers: {
      'X-API-Key': cleanKey,
      Accept: 'application/json'
    }
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`AusyncLab /voices HTTP ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const data: any = await resp.json();
  const rawList: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.result)
    ? data.result
    : Array.isArray(data?.voices)
    ? data.voices
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const voices = rawList
    .map((v: any) => {
      const id = String(v?.id ?? v?.voice_id ?? '').trim();
      const name = String(v?.name ?? v?.voice_name ?? id).trim();
      return { id, name, normName: stripVietnameseAccents(name) };
    })
    .filter((v) => v.id);

  voiceCacheByKey.set(cleanKey, { fetchedAt: Date.now(), voices });
  return voices;
}

async function resolveAusyncVoiceId(apiKey: string, requestedVoice?: string): Promise<{ id: string; name: string }> {
  const req = String(requestedVoice || 'thu-ha').trim();
  const normReq = stripVietnameseAccents(req);

  // If caller already passed a numeric or UUID voice_id directly
  if (/^\d+$/.test(req) || /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(req)) {
    return { id: req, name: req };
  }

  const voices = await listAusyncVoices(apiKey);
  if (voices.length === 0) {
    throw new Error('Không tìm thấy giọng đọc nào trong tài khoản AusyncLab.');
  }

  const targetQuery =
    normReq.includes('khoa') || normReq === 'dang-khoa' || normReq === 'male'
      ? 'dang khoa'
      : normReq.includes('ha') || normReq === 'thu-ha' || normReq === 'female'
      ? 'thu ha'
      : normReq;

  const exact = voices.find((v) => v.normName === targetQuery);
  if (exact) return { id: exact.id, name: exact.name };

  const partial = voices.find((v) => v.normName.includes(targetQuery));
  if (partial) return { id: partial.id, name: partial.name };

  return { id: voices[0].id, name: voices[0].name };
}

async function fetchAudioFromUrl(url: string, apiKey: string): Promise<{ buffer: Buffer; contentType: string }> {
  const resp = await fetch(url, {
    headers: { 'X-API-Key': apiKey }
  });
  if (!resp.ok) {
    throw new Error(`Không tải được audio AusyncLab (HTTP ${resp.status})`);
  }
  const ct = resp.headers.get('content-type') || 'audio/mpeg';
  const buf = Buffer.from(await resp.arrayBuffer());
  return { buffer: buf, contentType: ct };
}

export async function synthesizeAusyncTts(params: TtsRequestParams): Promise<TtsSynthesisResult> {
  const apiKey = String(params.ausyncApiKey || process.env.AUSYNCLAB_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Chưa cấu hình AUSYNCLAB_API_KEY.');
  }

  const text = String(params.text || '').replace(/\s+/g, ' ').trim();
  if (!text) {
    throw new Error('Thiếu nội dung văn bản để đọc.');
  }

  const resolvedVoice = await resolveAusyncVoiceId(apiKey, params.voice);
  const speed =
    typeof params.speed === 'number' && !Number.isNaN(params.speed)
      ? Math.min(1.5, Math.max(0.5, params.speed))
      : params.slow
      ? 0.85
      : 1.0;

  const modelName = params.modelName || process.env.AUSYNCLAB_MODEL || 'myna-1-turbo';
  const voiceIdPayload: string | number = /^\d+$/.test(resolvedVoice.id)
    ? Number(resolvedVoice.id)
    : resolvedVoice.id;

  const resp = await fetch(`${AUSYNC_API_BASE}/speech/text-to-speech`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json, audio/mpeg, audio/wav'
    },
    body: JSON.stringify({
      audio_name: `MHEdu_${Date.now()}`,
      text,
      voice_id: voiceIdPayload,
      speed,
      model_name: modelName
    })
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`AusyncLab TTS HTTP ${resp.status}: ${errText.slice(0, 260)}`);
  }

  const contentType = resp.headers.get('content-type') || '';
  if (contentType.startsWith('audio/')) {
    const buf = Buffer.from(await resp.arrayBuffer());
    return {
      buffer: buf,
      contentType,
      ext: contentType.includes('wav') ? 'wav' : 'mp3',
      provider: 'ausynclab',
      voiceUsed: resolvedVoice.name
    };
  }

  const data: any = await resp.json();
  const directUrl =
    data?.audio_url ||
    data?.result?.audio_url ||
    data?.data?.audio_url ||
    data?.url;

  if (directUrl) {
    const dl = await fetchAudioFromUrl(directUrl, apiKey);
    return {
      buffer: dl.buffer,
      contentType: dl.contentType,
      ext: dl.contentType.includes('wav') || directUrl.endsWith('.wav') ? 'wav' : 'mp3',
      provider: 'ausynclab',
      voiceUsed: resolvedVoice.name
    };
  }

  // If async job returns audio_id, poll briefly for completion
  const audioId = data?.result?.audio_id ?? data?.audio_id ?? data?.id;
  if (audioId) {
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise((r) => setTimeout(r, 800));
      const pollResp = await fetch(`${AUSYNC_API_BASE}/speech/${encodeURIComponent(String(audioId))}`, {
        headers: { 'X-API-Key': apiKey, Accept: 'application/json' }
      });
      if (!pollResp.ok) continue;
      const pollData: any = await pollResp.json();
      const readyUrl =
        pollData?.audio_url ||
        pollData?.result?.audio_url ||
        pollData?.data?.audio_url;
      if (readyUrl) {
        const dl = await fetchAudioFromUrl(readyUrl, apiKey);
        return {
          buffer: dl.buffer,
          contentType: dl.contentType,
          ext: dl.contentType.includes('wav') || readyUrl.endsWith('.wav') ? 'wav' : 'mp3',
          provider: 'ausynclab',
          voiceUsed: resolvedVoice.name
        };
      }
      const status = String(pollData?.status || pollData?.result?.status || '').toUpperCase();
      if (status === 'FAILED' || status === 'ERROR') {
        throw new Error(`AusyncLab tạo audio thất bại (${status}).`);
      }
    }
    throw new Error('Hết thời gian chờ AusyncLab tổng hợp giọng nói.');
  }

  throw new Error('AusyncLab không trả về dữ liệu âm thanh hoặc audio_url.');
}

function splitGoogleTtsChunks(raw: string, maxLen = 165): string[] {
  const clean = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];
  const sentences = clean.split(/(?<=[.!?;\n])\s+/);
  const chunks: string[] = [];
  let current = '';
  const pushWordSplit = (seg: string) => {
    const words = seg.split(' ');
    let cur = '';
    for (const w of words) {
      if ((cur ? cur + ' ' + w : w).length <= maxLen) {
        cur = cur ? cur + ' ' + w : w;
      } else {
        if (cur) chunks.push(cur);
        cur = w.length > maxLen ? w.slice(0, maxLen) : w;
      }
    }
    if (cur) chunks.push(cur);
  };
  for (const s of sentences) {
    if (!s) continue;
    if ((current ? current + ' ' + s : s).length <= maxLen) {
      current = current ? current + ' ' + s : s;
    } else {
      if (current) {
        chunks.push(current);
        current = '';
      }
      if (s.length <= maxLen) current = s;
      else pushWordSplit(s);
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function synthesizeTtsWithFallback(params: TtsRequestParams): Promise<TtsSynthesisResult> {
  const effectiveAusyncKey = String(params.ausyncApiKey || process.env.AUSYNCLAB_API_KEY || '').trim();
  const safeLang = (params.lang || 'vi').trim();

  // Prefer AusyncLab AI (Thu Hà / Đăng Khoa) whenever key is configured
  if (effectiveAusyncKey) {
    try {
      return await synthesizeAusyncTts({ ...params, ausyncApiKey: effectiveAusyncKey });
    } catch (err: any) {
      // If caller explicitly requested ausync voice with their own key, surface error if desired,
      // otherwise fall back cleanly to Google TTS so games never crash.
      console.warn('[AusyncLab TTS] Failed, falling back to Google TTS:', err?.message || err);
    }
  }

  const chunks = splitGoogleTtsChunks(params.text, 165);
  if (chunks.length === 0) {
    throw new Error('Thiếu nội dung văn bản để đọc.');
  }
  const speedParam = params.slow ? '0.24' : '1';
  const audioBuffers: Buffer[] = [];
  for (const chunk of chunks) {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
      safeLang
    )}&client=tw-ob&ttsspeed=${speedParam}&q=${encodeURIComponent(chunk)}`;
    const upstream = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/'
      }
    });
    if (!upstream.ok) {
      throw new Error(`Upstream TTS HTTP ${upstream.status}`);
    }
    audioBuffers.push(Buffer.from(await upstream.arrayBuffer()));
  }

  return {
    buffer: Buffer.concat(audioBuffers),
    contentType: 'audio/mpeg',
    ext: 'mp3',
    provider: 'google-fallback',
    voiceUsed: 'Google TTS'
  };
}
