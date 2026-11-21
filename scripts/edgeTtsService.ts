import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

const VOICE_DISPLAY_NAMES: Record<string, string> = {
  'vi-VN-HoaiMyNeural': 'Microsoft Hoài My (Nữ)',
  'vi-VN-NamMinhNeural': 'Microsoft Nam Minh (Nam)',
  'hoai-my': 'Microsoft Hoài My (Nữ)',
  'ms-hoaimy': 'Microsoft Hoài My (Nữ)',
  'nam-minh': 'Microsoft Nam Minh (Nam)',
  'ms-namminh': 'Microsoft Nam Minh (Nam)',
  'en-female': 'Microsoft Jenny (Nữ - Tiếng Anh)',
  'en-male': 'Microsoft Guy (Nam - Tiếng Anh)'
};

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

export async function synthesizeEdgeTts(options: EdgeTtsOptions): Promise<EdgeTtsResult> {
  const text = String(options.text || '').replace(/\s+/g, ' ').trim();
  if (!text) {
    throw new Error('Thiếu nội dung văn bản để tạo giọng đọc.');
  }

  const { voiceCode, displayName } = resolveEdgeVoice(options.voice);
  const speed = typeof options.speed === 'number' && !Number.isNaN(options.speed)
    ? Math.min(1.5, Math.max(0.6, options.speed))
    : options.slow ? 0.85 : 1.0;

  const tempDir = os.tmpdir();
  const textFile = path.join(tempDir, `edge_tts_in_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.txt`);
  const outFile = path.join(tempDir, `edge_tts_out_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp3`);

  fs.writeFileSync(textFile, text, { encoding: 'utf8' });

  const runnerPath = path.resolve(__dirname, 'edge_tts_runner.py');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  return new Promise<EdgeTtsResult>((resolve, reject) => {
    const proc = spawn(
      pythonCmd,
      [
        runnerPath,
        '--voice', voiceCode,
        '--speed', String(speed),
        '--output', outFile,
        '--text-file', textFile
      ],
      { windowsHide: true }
    );

    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('error', (err) => {
      cleanup();
      reject(new Error(`Không thể khởi chạy Python edge-tts: ${err.message}`));
    });

    proc.on('close', (code) => {
      try {
        if (code === 0 && fs.existsSync(outFile) && fs.statSync(outFile).size > 0) {
          const buffer = fs.readFileSync(outFile);
          cleanup();
          resolve({
            buffer,
            contentType: 'audio/mpeg',
            ext: 'mp3',
            provider: 'microsoft-edge',
            voiceUsed: displayName
          });
        } else {
          cleanup();
          reject(new Error(stderr.trim() || `edge-tts thoát với mã lỗi ${code}`));
        }
      } catch (err: any) {
        cleanup();
        reject(err);
      }
    });

    function cleanup() {
      try { if (fs.existsSync(textFile)) fs.unlinkSync(textFile); } catch {}
      try { if (fs.existsSync(outFile)) fs.unlinkSync(outFile); } catch {}
    }
  });
}
