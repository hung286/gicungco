// ============================================================================
// KHỐI 2: GIAO DIỆN DASHBOARD CMS CỦA GIÁO VIÊN (REACTJS & TAILWINDCSS)
// Tái hiện 100% giao diện quản trị PomyAI cho Thầy Hùng - THPT Số 1 Lê Hồng Phong
// Hotline: 0965908084 | Email: hungvd286@gmail.com | STK BIDV: 6320495851
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import type { Room, Question, Student } from './schema';
import { DEFAULT_TEACHER_PROFILE } from './schema';
import { ImathAzotaParser } from './imathAzotaParser';

export const TeacherDashboard: React.FC<{ onLaunchGame?: (room: Room) => void }> = ({ onLaunchGame }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<'questions' | 'roster' | 'rooms'>('questions');
  const [excelText, setExcelText] = useState<string>('');
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [newRoomTitle, setNewRoomTitle] = useState<string>('');
  const [newRoomGrade, setNewRoomGrade] = useState<'10' | '11' | '12'>('10');
  
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Load rooms from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mhedu_ey_rooms_v3');
      if (stored) {
        const parsed: Room[] = JSON.parse(stored);
        setRooms(parsed);
        const storedActive = localStorage.getItem('mhedu_ey_active_room_v3');
        if (storedActive && parsed.some(r => r.id === storedActive)) {
          setActiveRoomId(storedActive);
        } else if (parsed.length > 0) {
          setActiveRoomId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save rooms to localStorage on change
  const saveRooms = (updatedRooms: Room[], newActiveId?: string) => {
    setRooms(updatedRooms);
    localStorage.setItem('mhedu_ey_rooms_v3', JSON.stringify(updatedRooms));
    if (newActiveId) {
      setActiveRoomId(newActiveId);
      localStorage.setItem('mhedu_ey_active_room_v3', newActiveId);
    }
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  // Render Math with KaTeX whenever tab or questions change
  useEffect(() => {
    if (contentAreaRef.current) {
      ImathAzotaParser.renderMath(contentAreaRef.current);
    }
  }, [currentTab, activeRoom?.questions]);

  // Handle Docx Upload
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoom) return;
    try {
      alert('Đang bóc tách đề thi và hình ảnh chuẩn iMath & Azota...');
      const questions = await ImathAzotaParser.parseDocx(file);
      const updated = rooms.map(r => r.id === activeRoom.id ? { ...r, questions, updatedAt: Date.now() } : r);
      saveRooms(updated);
      alert(`Thành công! Đã trích xuất ${questions.length} câu hỏi và hình ảnh.`);
    } catch (err: any) {
      alert('Lỗi import file: ' + err.message);
    }
  };

  // Handle Excel Roster Copy-Paste
  const handleApplyRoster = () => {
    if (!activeRoom || !excelText.trim()) return;
    const lines = excelText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const newRoster: Student[] = lines.map((name, idx) => {
      const parts = name.split(/\s+/);
      const shortName = parts[parts.length - 1] || name;
      return {
        id: 'st_' + (idx + 1),
        name,
        shortName,
        gender: idx % 2 === 0 ? 'nam' : 'nu',
        avatarIndex: idx % 6,
        status: 'ready',
        score: 0,
        violations: 0
      };
    });

    const updated = rooms.map(r => r.id === activeRoom.id ? { ...r, roster: newRoster, updatedAt: Date.now() } : r);
    saveRooms(updated);
    setExcelText('');
    alert(`Đã cập nhật sĩ số: ${newRoster.length} học sinh vào lớp!`);
  };

  // Handle Create Room
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const newRoom: Room = {
      id: 'room_' + Date.now(),
      pin,
      title: newRoomTitle.trim(),
      subject: 'Toán học',
      grade: newRoomGrade,
      teacher: DEFAULT_TEACHER_PROFILE,
      settings: {
        timePerQuestion: 30,
        shuffleQuestions: true,
        strictMode: true,
        gameMode: 'nhanh-chan-vao-lop'
      },
      questions: [],
      roster: [
        { id: 'st_1', name: "Nguyễn Văn An", shortName: "An", gender: "nam", avatarIndex: 0, status: "ready", score: 0, violations: 0 },
        { id: 'st_2', name: "Trần Thị Bích", shortName: "Bích", gender: "nu", avatarIndex: 1, status: "ready", score: 0, violations: 0 }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    saveRooms([newRoom, ...rooms], newRoom.id);
    setNewRoomTitle('');
    setIsCreatingRoom(false);
    setCurrentTab('questions');
  };

  // Handle Delete Question
  const handleDeleteQuestion = (idx: number) => {
    if (!activeRoom || !confirm(`Xác nhận xóa câu hỏi số ${idx + 1}?`)) return;
    const updatedQ = [...activeRoom.questions];
    updatedQ.splice(idx, 1);
    const updated = rooms.map(r => r.id === activeRoom.id ? { ...r, questions: updatedQ } : r);
    saveRooms(updated);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* SIDEBAR LEFT */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Brand */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-orange-500/30">
              🎓
            </div>
            <div>
              <div className="font-extrabold text-amber-400 text-sm tracking-wide">POMYAI · MHEDU</div>
              <div className="text-xs text-slate-400">Trang Quản Trị Giáo Viên</div>
            </div>
          </div>

          {/* Teacher Badge Card */}
          <div className="m-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-[11px] font-bold uppercase text-orange-400">Giáo viên phụ trách</div>
            <div className="font-bold text-white text-sm">{DEFAULT_TEACHER_PROFILE.name}</div>
            <div className="text-xs text-slate-300 mt-0.5">{DEFAULT_TEACHER_PROFILE.school}</div>
            <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[11px] text-slate-400">
              <span>Hotline: <b className="text-slate-200">{DEFAULT_TEACHER_PROFILE.phone}</b></span>
              <span className="text-emerald-400 font-bold">✓ Miễn phí</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setCurrentTab('questions')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                currentTab === 'questions' ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>📝</span> Quản lý Bộ Câu hỏi ({activeRoom?.questions.length || 0})
            </button>
            <button
              onClick={() => setCurrentTab('roster')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                currentTab === 'roster' ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>👥</span> Danh sách Học sinh ({activeRoom?.roster.length || 0})
            </button>
            <button
              onClick={() => setCurrentTab('rooms')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                currentTab === 'rooms' ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🚪</span> Danh sách Phòng chơi ({rooms.length})
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <span>Ủng hộ ly cà phê:</span>
            <b className="text-amber-400">BIDV 6320495851</b>
          </div>
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs transition-colors"
          >
            <span>🏠</span> Quay lại Trang chủ
          </a>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Top Header Bar */}
        <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-white">
              {currentTab === 'questions' && '📝 Quản lý Bộ Câu hỏi & Đề thi'}
              {currentTab === 'roster' && '👥 Lưới Danh sách Học sinh (Excel Grid)'}
              {currentTab === 'rooms' && '🚪 Quản lý Phòng học'}
            </h1>
            {activeRoom && (
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs px-2.5 py-1 rounded-full font-bold">
                Mã PIN: {activeRoom.pin}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatingRoom(true)}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              ➕ Tạo phòng mới
            </button>
            <button
              onClick={() => activeRoom && onLaunchGame?.(activeRoom)}
              className="bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 border border-emerald-400 flex items-center gap-2 transition-all"
            >
              <span>🎮</span> Bắt đầu chơi (Game Client)
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div ref={contentAreaRef} className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: QUESTIONS */}
          {currentTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <label className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-black px-4 py-2.5 rounded-xl border border-blue-400 cursor-pointer shadow-md shadow-blue-600/30 flex items-center gap-2">
                    <span>📥</span> Tải lên File Word (.docx) chuẩn iMath / Azota
                    <input type="file" accept=".docx" onChange={handleDocxUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Questions Cards */}
              <div className="space-y-3">
                {activeRoom?.questions.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl">
                    <div className="text-5xl mb-3">📄</div>
                    <div className="font-bold text-amber-400 text-base">Chưa có câu hỏi nào trong phòng!</div>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Hãy bấm nút tải lên file Word (.docx) chuẩn iMath hoặc Azota để hệ thống tự động bóc tách câu hỏi, đáp án và đồ thị.
                    </p>
                  </div>
                ) : (
                  activeRoom?.questions.map((q, idx) => (
                    <div key={q.id || idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex flex-col gap-1 shrink-0">
                            <span className="bg-orange-600 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                              Câu {idx + 1}
                            </span>
                            {q.type === 'tf' ? (
                              <span className="bg-purple-600/80 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                Đúng / Sai (Phần II)
                              </span>
                            ) : q.type === 'short' ? (
                              <span className="bg-emerald-600/80 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                Trả lời ngắn (Phần III)
                              </span>
                            ) : (
                              <span className="bg-blue-600/80 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                Trắc nghiệm (Phần I)
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-slate-100 leading-relaxed flex-1">
                            {q.content}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(idx)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-3 py-1 rounded-lg font-bold transition-all"
                        >
                          ✕ Xóa
                        </button>
                      </div>

                      {/* Embedded diagram preview with zoom indicator */}
                      {q.image && (
                        <div className="ml-11 inline-block relative group">
                          <img
                            src={q.image}
                            alt="Sơ đồ iMath"
                            className="max-h-36 rounded-lg border border-slate-700 cursor-zoom-in"
                            onClick={() => (window as any).ZoomPanOverlay?.open(q.image)}
                          />
                          <span className="absolute bottom-2 right-2 bg-black/70 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold pointer-events-none">
                            🔍 Bấm để Zoom
                          </span>
                        </div>
                      )}

                      {/* True/False Sub-Items (Phần II) */}
                      {q.type === 'tf' && q.subItems && q.subItems.length > 0 ? (
                        <div className="flex flex-col gap-2 ml-11">
                          {q.subItems.map(sub => (
                            <div
                              key={sub.key}
                              className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-3 border ${
                                sub.isCorrect ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-200' : 'bg-slate-800/40 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-amber-400">Ý {sub.key})</span>
                                <span>{sub.text}</span>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded text-[11px] font-black ${
                                sub.isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              }`}>
                                {sub.isCorrect ? '✓ ĐÚNG' : '✕ SAI'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : q.type === 'short' ? (
                        <div className="ml-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500 text-emerald-300 font-bold text-sm">
                          <span>🎯 Đáp án chuẩn:</span>
                          <span className="text-white font-black text-base">{q.correctValue || q.correctAnswer}</span>
                        </div>
                      ) : (
                        /* Options Grid (Phần I) */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 ml-11">
                          {q.options.map(opt => (
                            <div
                              key={opt.key}
                              className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border ${
                                opt.key === q.correctAnswer
                                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                                  : 'bg-slate-800/40 border-slate-800 text-slate-300'
                              }`}
                            >
                              <span className="font-black text-amber-400">{opt.key}.</span>
                              <span className="flex-1">{opt.text}</span>
                              {opt.key === q.correctAnswer && <span className="text-emerald-400 font-black">✓</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.explanation && (
                        <div className="ml-11 text-xs text-slate-400 italic">
                          💡 Lời giải: {q.explanation}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ROSTER (EXCEL GRID) */}
          {currentTab === 'roster' && (
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-amber-400 text-sm">Dán danh sách từ Excel / Google Sheets</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Sao chép một cột danh sách họ tên từ Excel rồi dán thẳng vào ô dưới:</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold">
                    Sĩ số hiện tại: {activeRoom?.roster.length || 0} em
                  </span>
                </div>

                <textarea
                  value={excelText}
                  onChange={(e) => setExcelText(e.target.value)}
                  placeholder="Ví dụ:&#10;Nguyễn Văn An&#10;Trần Thị Bích&#10;Lê Hoàng Long..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none font-mono"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleApplyRoster}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    ✓ Cập nhật danh sách học sinh
                  </button>
                </div>
              </div>

              {/* Roster Cards Display */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-slate-300">Danh sách học sinh trong phòng:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {activeRoom?.roster.map((st, i) => (
                    <div key={st.id || i} className="p-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[11px] font-black text-amber-400">{i + 1}.</span>
                        <span className="text-xs font-semibold text-slate-100 truncate">{st.name}</span>
                      </div>
                      <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 shrink-0">
                        {st.shortName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROOMS LIST */}
          {currentTab === 'rooms' && (
            <div className="max-w-3xl mx-auto space-y-3">
              {rooms.map(r => (
                <div
                  key={r.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    r.id === activeRoomId ? 'bg-slate-900 border-orange-500 shadow-md shadow-orange-500/10' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">{r.title}</span>
                      {r.id === activeRoomId && (
                        <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          Đang chọn
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-4">
                      <span>Mã PIN: <b className="text-emerald-400">{r.pin}</b></span>
                      <span>Lớp {r.grade}</span>
                      <span>{r.questions.length} câu hỏi</span>
                      <span>{r.roster.length} học sinh</span>
                    </div>
                  </div>

                  {r.id !== activeRoomId && (
                    <button
                      onClick={() => {
                        setActiveRoomId(r.id);
                        localStorage.setItem('mhedu_ey_active_room_v3', r.id);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-1.5 rounded-xl border border-slate-700"
                    >
                      Chọn phòng này
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* CREATE ROOM MODAL */}
      {isCreatingRoom && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateRoom} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-amber-400">Tạo Phòng Học Mới</h3>
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">Tên phòng / Chủ đề:</label>
              <input
                type="text"
                required
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                placeholder="Ví dụ: Ôn tập Đại số 10 - Tiết 3"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">Khối lớp:</label>
              <select
                value={newRoomGrade}
                onChange={(e) => setNewRoomGrade(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="10">Lớp 10</option>
                <option value="11">Lớp 11</option>
                <option value="12">Lớp 12</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingRoom(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md"
              >
                Tạo phòng
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
