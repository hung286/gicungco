// ============================================================================
// KHỐI 1A: SƠ ĐỒ CƠ SỞ DỮ LIỆU & STORAGE ENGINE (POMYAI - MHEDU)
// Tác giả: Thầy Hùng - Trường THPT Số 1 Lê Hồng Phong
// Hotline / Zalo: 0965908084 | Email: nmh28691@gmail.com | FB: fb.com/doiten234
// Bản quyền: Hoàn toàn Miễn phí 100% cho Giáo viên và Học sinh toàn quốc
// ============================================================================

export interface TeacherProfile {
  name: string;
  school: string;
  phone: string;
  zalo: string;
  email: string;
  facebook: string;
  donate: {
    bank: string;
    accountNumber: string;
    accountName: string;
  };
  policy: string;
}

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  image?: string | null;
}

export interface QuestionSubItem {
  key: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  number: number;
  part?: number;
  type?: 'mc' | 'tf' | 'short';
  content: string;
  image?: string | null; // Base64 data URL or remote URL
  options: QuestionOption[];
  subItems?: QuestionSubItem[];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | string;
  correctValue?: string;
  explanation?: string;
  category?: string;
}

export interface Student {
  id: string;
  name: string;
  shortName: string;
  gender: 'nam' | 'nu';
  avatarIndex: number;
  status: 'ready' | 'running' | 'safe' | 'caught';
  score: number;
  violations: number;
}

export interface RoomSettings {
  timePerQuestion: number; // in seconds
  shuffleQuestions: boolean;
  strictMode: boolean; // Trap violation triggers immediately
  gameMode: 'nhanh-chan-vao-lop' | 'chay-tron-thay-co' | 'muc-oi-dung-day' | 'choc-xoai-cham-muoi' | 'ca-xom-tron-tra-bai' | 'cuong-thi' | 'co-goi-ve-nha' | string;
}

export interface Room {
  id: string;
  pin: string; // 6-digit room PIN
  title: string;
  subject: string;
  grade: '10' | '11' | '12' | 'THCS' | 'Khác';
  teacher: TeacherProfile;
  settings: RoomSettings;
  questions: Question[];
  roster: Student[];
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
  name: "Thầy Hùng",
  school: "Trường THPT Số 1 Lê Hồng Phong",
  phone: "0965908084",
  zalo: "0965908084",
  email: "nmh28691@gmail.com",
  facebook: "https://fb.com/doiten234",
  donate: {
    bank: "BIDV",
    accountNumber: "6320495851",
    accountName: "NGUYEN MANH HUNG"
  },
  policy: "Hoàn toàn Miễn phí 100% cho Giáo viên và Học sinh toàn quốc"
};
