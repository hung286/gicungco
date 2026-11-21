import { EdgeTTS } from '@andresaya/edge-tts';

export interface EdgeTtsOptions {
  text: string;
  voice?: string; // 'vi-VN-HoaiMyNeural' | 'vi-VN-NamMinhNeural' | 'hoai-my' | 'nam-minh' | 'ms-hoaimy' | 'ms-namminh'
  speed?: number; // 0.7 - 1.5
  slow?: boolean;
}

export interface EdgeTtsResult {
  buffer: Buffer;
  contentType: string;
  ext: string;
  provider: 'microsoft-edge';
  voiceUsed: string;
}

export function resolveEdgeVoice(raw?: string): { voiceCode: string; displayName: string } {
  const norm = String(raw || '').trim().toLowerCase();
  if (norm.includes('nam') || norm.includes('minh') || norm.includes('nam-minh') || norm === 'male') {
    return { voiceCode: 'vi-VN-NamMinhNeural', displayName: 'Microsoft Nam Minh (Nam)' };
  }
  if (norm.includes('jenny') || norm.includes('en-female')) {
    return { voiceCode: 'en-US-JennyNeural', displayName: 'Microsoft Jenny (Nữ - Tiếng Anh)' };
  }
  if (norm.includes('guy') || norm.includes('en-male')) {
    return { voiceCode: 'en-US-GuyNeural', displayName: 'Microsoft Guy (Nam - Tiếng Anh)' };
  }
  return { voiceCode: 'vi-VN-HoaiMyNeural', displayName: 'Microsoft Hoài My (Nữ)' };
}

function formatRate(speed?: number, slow?: boolean): string {
  if (slow) return '-15%';
  if (typeof speed !== 'number' || Number.isNaN(speed)) return '+0%';
  const pct = Math.round((speed - 1.0) * 100);
  if (pct >= 0) return `+${pct}%`;
  return `${pct}%`;
}

export async function synthesizeEdgeTts(options: EdgeTtsOptions): Promise<EdgeTtsResult> {
  const text = String(options.text || '').replace(/\s+/g, ' ').trim();
  if (!text) {
    throw new Error('Thiếu nội dung văn bản để tạo giọng đọc.');
  }

  const { voiceCode, displayName } = resolveEdgeVoice(options.voice);
  const rateStr = formatRate(options.speed, options.slow);

  const tts = new EdgeTTS({
    voice: voiceCode,
    lang: voiceCode.startsWith('vi') ? 'vi-VN' : 'en-US',
    rate: rateStr
  });

  const generatePromise = tts.generate(text);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Microsoft Edge TTS timed out after 8s')), 8000)
  );

  const res = await Promise.race([generatePromise, timeoutPromise]);
  const audioBuf = Buffer.isBuffer(res.audio) ? res.audio : Buffer.from(res.audio);

  return {
    buffer: audioBuf,
    contentType: 'audio/mpeg',
    ext: 'mp3',
    provider: 'microsoft-edge',
    voiceUsed: displayName
  };
}
