import { synthesizeEdgeTts, resolveEdgeVoice } from './edgeTtsService';

export interface TtsRequestParams {
  text: string;
  lang?: string;
  slow?: boolean;
  speed?: number;
  voice?: string; // 'hoai-my' | 'nam-minh' | 'thu-ha' | 'dang-khoa' | 'vi-VN-HoaiMyNeural' | 'vi-VN-NamMinhNeural' | custom voice_id
  ausyncApiKey?: string;
  modelName?: string;
}

export interface TtsSynthesisResult {
  buffer: Buffer;
  contentType: string;
  ext: string;
  provider: 'microsoft-edge' | 'ausynclab' | 'google-fallback';
  voiceUsed: string;
}

const AUSYNC_API_BASE = 'https://api.ausynclab.io/api/v1';

interface CachedVoices {
  fetchedAt: number;
  voices: Array<{ id: string | number; name: string; normName: string }>;
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
    throw new Error('Thiếu AusyncLab API Key (X-API-Key). Thầy cô vui lòng dán X-API-Key từ trang ausynclab.io.');
  }

  const cached = voiceCacheByKey.get(cleanKey);
  if (cached && Date.now() - cached.fetchedAt < 10 * 60 * 1000) {
    return cached.voices;
  }

  const resp = await fetch(`${AUSYNC_API_BASE}/voices/list`, {
    method: 'GET',
    headers: {
      'X-API-Key': cleanKey,
      Accept: 'application/json'
    }
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    let msg = `AusyncLab /voices/list HTTP ${resp.status}`;
    try {
      const errObj = JSON.parse(errText);
      msg = errObj?.detail || errObj?.message || errObj?.error || msg;
    } catch {}
    throw new Error(msg);
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
      const id = v?.id ?? v?.voice_id ?? '';
      const name = String(v?.name ?? v?.voice_name ?? id).trim();
      return { id, name, normName: stripVietnameseAccents(name) };
    })
    .filter((v) => v.id !== '');

  if (voices.length === 0) {
    // Default fallback voice definitions for AusyncLab if list is empty
    voices.push(
      { id: 1, name: 'Thu Hà (Nữ)', normName: 'thu ha' },
      { id: 2, name: 'Đăng Khoa (Nam)', normName: 'dang khoa' }
    );
  }

  voiceCacheByKey.set(cleanKey, { fetchedAt: Date.now(), voices });
  return voices;
}

async function resolveAusyncVoiceId(apiKey: string, requestedVoice?: string): Promise<{ id: number; name: string }> {
  const req = String(requestedVoice || 'thu-ha').trim();
  const normReq = stripVietnameseAccents(req);

  // If numeric voice_id was passed directly
  if (/^\d+$/.test(req)) {
    return { id: parseInt(req, 10), name: `Voice #${req}` };
  }

  try {
    const voices = await listAusyncVoices(apiKey);
    const targetQuery =
      normReq.includes('khoa') || normReq === 'dang-khoa' || normReq === 'male'
        ? 'dang khoa'
        : normReq.includes('ha') || normReq === 'thu-ha' || normReq === 'female'
        ? 'thu ha'
        : normReq;

    const exact = voices.find((v) => v.normName === targetQuery);
    if (exact) return { id: Number(exact.id) || 1, name: exact.name };

    const partial = voices.find((v) => v.normName.includes(targetQuery));
    if (partial) return { id: Number(partial.id) || 1, name: partial.name };

    if (voices.length > 0) {
      return { id: Number(voices[0].id) || 1, name: voices[0].name };
    }
  } catch (e) {
    // If voice list fetch fails, map defaults
    if (normReq.includes('khoa') || normReq === 'dang-khoa' || normReq === 'male') {
      return { id: 2, name: 'Đăng Khoa (Nam)' };
    }
    return { id: 1, name: 'Thu Hà (Nữ)' };
  }

  return { id: 1, name: 'Thu Hà (Nữ)' };
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
    throw new Error('Chưa cấu hình AUSYNCLAB_API_KEY (X-API-Key).');
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
  const voiceId = Number(resolvedVoice.id) || 1;

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
      voice_id: voiceId,
      speed,
      model_name: modelName,
      language: 'vi'
    })
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    let detailMsg = `AusyncLab TTS HTTP ${resp.status}`;
    try {
      const errJson = JSON.parse(errText);
      detailMsg = errJson?.detail || errJson?.message || errJson?.error || detailMsg;
    } catch {
      if (errText) detailMsg += `: ${errText.slice(0, 150)}`;
    }
    throw new Error(detailMsg);
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
    for (let attempt = 0; attempt < 15; attempt++) {
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
  const rawVoice = String(params.voice || '').toLowerCase();
  const effectiveAusyncKey = String(params.ausyncApiKey || process.env.AUSYNCLAB_API_KEY || '').trim();

  // 1. If user explicitly chooses Microsoft Hoài My or Nam Minh
  const isMsRequested =
    rawVoice.includes('hoai-my') ||
    rawVoice.includes('hoaimy') ||
    rawVoice.includes('nam-minh') ||
    rawVoice.includes('namminh') ||
    rawVoice.includes('microsoft') ||
    rawVoice.includes('vi-vn-hoaimyneural') ||
    rawVoice.includes('vi-vn-namminhneural') ||
    rawVoice.startsWith('ms-');

  if (isMsRequested) {
    try {
      const edgeResult = await synthesizeEdgeTts({
        text: params.text,
        voice: params.voice,
        speed: params.speed,
        slow: params.slow
      });
      return {
        buffer: edgeResult.buffer,
        contentType: edgeResult.contentType,
        ext: edgeResult.ext,
        provider: 'microsoft-edge',
        voiceUsed: edgeResult.voiceUsed
      };
    } catch (err: any) {
      console.warn('[Edge TTS] Synthesis failed, falling back:', err?.message || err);
    }
  }

  // 2. If AusyncLab key is provided and AusyncLab was selected
  const isAusyncRequested =
    rawVoice.includes('thu-ha') ||
    rawVoice.includes('dang-khoa') ||
    rawVoice.includes('ausync') ||
    !!effectiveAusyncKey;

  if (isAusyncRequested && effectiveAusyncKey) {
    try {
      return await synthesizeAusyncTts({ ...params, ausyncApiKey: effectiveAusyncKey });
    } catch (err: any) {
      console.warn('[AusyncLab TTS] Failed, falling back to Microsoft Edge TTS:', err?.message || err);
      // Fallback from AusyncLab directly to Microsoft Hoài My / Nam Minh
      try {
        const edgeVoice = rawVoice.includes('khoa') ? 'vi-VN-NamMinhNeural' : 'vi-VN-HoaiMyNeural';
        const edgeResult = await synthesizeEdgeTts({
          text: params.text,
          voice: edgeVoice,
          speed: params.speed,
          slow: params.slow
        });
        return {
          buffer: edgeResult.buffer,
          contentType: edgeResult.contentType,
          ext: edgeResult.ext,
          provider: 'microsoft-edge',
          voiceUsed: `${edgeResult.voiceUsed} (Dự phòng)`
        };
      } catch {}
    }
  }

  // 3. Try Microsoft Edge TTS as the default high-quality engine (Hoài My / Nam Minh)
  try {
    const edgeVoice = rawVoice.includes('khoa') || rawVoice.includes('nam') ? 'vi-VN-NamMinhNeural' : 'vi-VN-HoaiMyNeural';
    const edgeResult = await synthesizeEdgeTts({
      text: params.text,
      voice: edgeVoice,
      speed: params.speed,
      slow: params.slow
    });
    return {
      buffer: edgeResult.buffer,
      contentType: edgeResult.contentType,
      ext: edgeResult.ext,
      provider: 'microsoft-edge',
      voiceUsed: edgeResult.voiceUsed
    };
  } catch (edgeErr: any) {
    console.warn('[Edge TTS Default] Failed, falling back to Google TTS:', edgeErr?.message || edgeErr);
  }

  // 4. Ultimate fallback: Google Translate TTS
  const safeLang = (params.lang || 'vi').trim();
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
