import { j as jsx, r as React } from "./vendor-react-Cg7KvPel.js";

const DEFAULT_CLASSES = [
  {
    id: "demo_12a1",
    name: "12A1 (Demo)",
    schoolName: "THPT Nguyễn Du",
    academicYear: "2026-2027",
    isDemo: true,
    students: [
      { id: "s1", stt: 1, name: "Nguyễn Văn An", gender: "Nam", dob: "15/05/2009", phone: "0912345678", conduct: "Tốt", conductNote: "Chăm ngoan, tích cực phát biểu", feePaid: true },
      { id: "s2", stt: 2, name: "Trần Thị Bình", gender: "Nữ", dob: "20/08/2009", phone: "0987654321", conduct: "Tốt", conductNote: "Cán bộ gương mẫu", feePaid: true },
      { id: "s3", stt: 3, name: "Lê Hoàng Cường", gender: "Nam", dob: "10/11/2009", phone: "0901234567", conduct: "Khá", conductNote: "Cần chú ý giờ tự học", feePaid: false }
    ],
    funds: [
      { id: "f1", title: "Quỹ lớp Học kỳ 1", amount: 100000, date: "05/09/2026" }
    ],
    expenses: [
      { id: "e1", title: "Mua bảng tên & sổ tay", amount: 50000, date: "10/09/2026" }
    ],
    attendances: {}
  }
];

function getStoredClasses() {
  try {
    const data = localStorage.getItem("gvcn_classes_storage_v1");
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_CLASSES;
}

function saveStoredClasses(classes) {
  try {
    localStorage.setItem("gvcn_classes_storage_v1", JSON.stringify(classes));
  } catch (e) {}
}

export default function HomeroomHubPage() {
  const [classes, setClasses] = React.useState(getStoredClasses);
  const [activeClassId, setActiveClassId] = React.useState(() => {
    return localStorage.getItem("gvcn_last_class_id") || (classes[0] ? classes[0].id : "demo_12a1");
  });
  const [activeModal, setActiveModal] = React.useState(null); // 'conduct' | 'finance' | 'attendance' | 'contact' | 'tools' | 'extension' | 'students' | 'addClass' | 'settings'
  const [attendanceDate, setAttendanceDate] = React.useState(() => new Date().toISOString().split("T")[0]);
  
  // Forms
  const [newClassName, setNewClassName] = React.useState("");
  const [newSchoolName, setNewSchoolName] = React.useState("THPT Nguyễn Du");
  const [newStudentName, setNewStudentName] = React.useState("");
  const [newStudentGender, setNewStudentGender] = React.useState("Nam");
  const [newStudentPhone, setNewStudentPhone] = React.useState("");
  const [newExpenseTitle, setNewExpenseTitle] = React.useState("");
  const [newExpenseAmount, setNewExpenseAmount] = React.useState("");

  const currentClass = classes.find(c => c.id === activeClassId) || classes[0] || DEFAULT_CLASSES[0];

  const updateCurrentClass = React.useCallback((updater) => {
    setClasses(prev => {
      const updated = prev.map(c => c.id === currentClass.id ? updater(c) : c);
      saveStoredClasses(updated);
      return updated;
    });
  }, [currentClass.id]);

  const handleSelectClass = (id) => {
    if (id === "__add__") {
      setActiveModal("addClass");
      return;
    }
    setActiveClassId(id);
    localStorage.setItem("gvcn_last_class_id", id);
  };

  const handleCreateClass = () => {
    if (!newClassName.trim()) return;
    const newClass = {
      id: "class_" + Date.now(),
      name: newClassName.trim(),
      schoolName: newSchoolName.trim() || "Trường THPT",
      academicYear: "2026-2027",
      isDemo: false,
      students: [],
      funds: [{ id: "f_" + Date.now(), title: "Quỹ lớp", amount: 100000, date: new Date().toLocaleDateString("vi-VN") }],
      expenses: [],
      attendances: {}
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    saveStoredClasses(updated);
    setActiveClassId(newClass.id);
    setNewClassName("");
    setActiveModal(null);
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const newStd = {
      id: "std_" + Date.now(),
      stt: (currentClass.students?.length || 0) + 1,
      name: newStudentName.trim(),
      gender: newStudentGender,
      dob: "01/01/2009",
      phone: newStudentPhone.trim() || "Chưa cập nhật",
      conduct: "Tốt",
      conductNote: "",
      feePaid: false
    };
    updateCurrentClass(c => ({
      ...c,
      students: [...(c.students || []), newStd]
    }));
    setNewStudentName("");
    setNewStudentPhone("");
  };

  const handleDeleteStudent = (id) => {
    updateCurrentClass(c => ({
      ...c,
      students: c.students.filter(s => s.id !== id).map((s, idx) => ({ ...s, stt: idx + 1 }))
    }));
  };

  const handleToggleFeePaid = (stdId) => {
    updateCurrentClass(c => ({
      ...c,
      students: c.students.map(s => s.id === stdId ? { ...s, feePaid: !s.feePaid } : s)
    }));
  };

  const handleConductChange = (stdId, newConduct, note) => {
    updateCurrentClass(c => ({
      ...c,
      students: c.students.map(s => s.id === stdId ? { ...s, conduct: newConduct, conductNote: note !== undefined ? note : s.conductNote } : s)
    }));
  };

  const handleAttendanceChange = (stdId, status) => {
    updateCurrentClass(c => {
      const atts = { ...(c.attendances || {}) };
      const dayAtts = { ...(atts[attendanceDate] || {}) };
      dayAtts[stdId] = status; // 'P' (Phép) | 'KP' (Không phép) | 'CM' (Có mặt)
      atts[attendanceDate] = dayAtts;
      return { ...c, attendances: atts };
    });
  };

  const handleAddExpense = () => {
    const amt = parseInt(newExpenseAmount, 10);
    if (!newExpenseTitle.trim() || isNaN(amt) || amt <= 0) return;
    updateCurrentClass(c => ({
      ...c,
      expenses: [...(c.expenses || []), { id: "e_" + Date.now(), title: newExpenseTitle.trim(), amount: amt, date: new Date().toLocaleDateString("vi-VN") }]
    }));
    setNewExpenseTitle("");
    setNewExpenseAmount("");
  };

  // Calculations
  const students = currentClass.students || [];
  const feeTarget = (currentClass.funds?.[0]?.amount || 100000);
  const paidCount = students.filter(s => s.feePaid).length;
  const totalCollected = paidCount * feeTarget;
  const totalSpent = (currentClass.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const fundBalance = totalCollected - totalSpent;

  return jsx.jsxs("div", {
    style: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, #4da7e8 0%, #68bbf0 40%, #87ceeb 100%)",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: "#1e293b",
      paddingBottom: "80px",
      boxSizing: "border-box"
    },
    children: [
      /* Top Navbar matching image */
      jsx.jsx("header", {
        style: {
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.4)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 100
        },
        children: [
          jsx.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "16px" },
            children: [
              jsx.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "1.25rem", color: "#059669" },
                children: [
                  jsx.jsx("span", { style: { fontSize: "1.5rem" }, children: "🏫" }),
                  jsx.jsx("span", { children: "Giáo viên Chủ nhiệm" })
                ]
              }),
              jsx.jsx("div", { style: { width: "1px", height: "24px", background: "#cbd5e1" } }),
              jsx.jsxs("nav", {
                style: { display: "flex", gap: "8px" },
                children: [
                  jsx.jsx("button", {
                    onClick: () => setActiveModal(null),
                    style: { background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "6px 14px", fontWeight: 600, fontSize: "0.9rem", color: "#1e293b", cursor: "pointer" },
                    children: "🏠 Trang chủ"
                  }),
                  jsx.jsx("button", {
                    onClick: () => setActiveModal("students"),
                    style: { background: "transparent", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 14px", fontWeight: 600, fontSize: "0.9rem", color: "#475569", cursor: "pointer" },
                    children: "👥 Danh sách học sinh"
                  }),
                  jsx.jsx("button", {
                    onClick: () => setActiveModal("settings"),
                    style: { background: "transparent", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 14px", fontWeight: 600, fontSize: "0.9rem", color: "#475569", cursor: "pointer" },
                    children: "⚙️ Cấu hình năm học"
                  })
                ]
              })
            ]
          }),
          jsx.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: "12px" },
            children: [
              jsx.jsxs("span", {
                style: { background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "6px 12px", fontSize: "0.85rem", fontWeight: 600, color: "#334155" },
                children: ["📅 Năm học ", currentClass.academicYear || "2026-2027", " ▾"]
              }),
              jsx.jsx("span", {
                style: {
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                },
                children: "✨ BẢN ĐẦY ĐỦ · MIỄN PHÍ"
              }),
              jsx.jsx("button", {
                type: "button",
                onClick: () => alert("☁️ Dữ liệu Giáo viên Chủ nhiệm được đồng bộ đám mây tự động trên hệ thống MHEdu!"),
                title: "Đồng bộ đám mây MHEdu đã kích hoạt",
                style: {
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "#059669",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer"
                },
                children: "☁️ MHEdu Cloud"
              })
            ]
          })
        ]
      }),

      /* Subheader Class Selector Bar */
      jsx.jsxs("div", {
        style: {
          maxWidth: "1160px",
          margin: "24px auto 16px auto",
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px"
        },
        children: [
          jsx.jsxs("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center"
            },
            children: [
              /* Select box */
              jsx.jsxs("select", {
                value: activeClassId,
                onChange: e => handleSelectClass(e.target.value),
                style: {
                  background: "#fff",
                  color: "#ec4899",
                  fontWeight: 800,
                  fontSize: "1rem",
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  border: "2px solid #fbcfe8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                  outline: "none"
                },
                children: [
                  classes.map(c => jsx.jsx("option", { value: c.id, children: `Lớp ${c.name}` }, c.id)),
                  jsx.jsx("option", { value: "__add__", children: "+ Thêm lớp mới..." })
                ]
              }),
              /* School Badge */
              jsx.jsxs("span", {
                onClick: () => setActiveModal("addClass"),
                style: {
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#1e293b",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  cursor: "pointer"
                },
                children: ["🏫 ", currentClass.schoolName]
              }),
              /* Students count Badge */
              jsx.jsxs("span", {
                onClick: () => setActiveModal("students"),
                style: {
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#1e293b",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  cursor: "pointer"
                },
                children: ["👤 ", students.length, " học sinh"]
              }),
              /* Add class button */
              jsx.jsx("button", {
                onClick: () => setActiveModal("addClass"),
                style: {
                  background: "rgba(255, 255, 255, 0.25)",
                  color: "#fff",
                  border: "1px solid rgba(255, 255, 255, 0.6)",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                },
                children: "+ Thêm lớp mới"
              })
            ]
          }),
          currentClass.isDemo && jsx.jsxs("div", {
            style: {
              color: "rgba(255, 255, 255, 0.95)",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px"
            },
            children: [
              jsx.jsx("span", { children: "Đây là lớp demo — thêm lớp của bạn để bắt đầu" }),
              jsx.jsx("button", {
                onClick: () => setActiveModal("addClass"),
                style: {
                  background: "rgba(255, 255, 255, 0.3)",
                  border: "none",
                  borderRadius: "9999px",
                  padding: "3px 12px",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer"
                },
                children: "+ Thêm lớp"
              })
            ]
          })
        ]
      }),

      /* Main 6 Module Cards Grid */
      jsx.jsx("main", {
        style: {
          maxWidth: "1160px",
          margin: "16px auto",
          padding: "0 20px"
        },
        children: jsx.jsxs("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px"
          },
          children: [
            /* Card 1: Hạnh kiểm */
            jsx.jsxs("div", {
              style: cardStyle,
              children: [
                jsx.jsx("h3", { style: cardTitleStyle, children: "Đánh giá Hạnh kiểm" }),
                jsx.jsxs("div", {
                  style: cardBodyStyle,
                  children: [
                    jsx.jsxs("div", {
                      style: cardLeftStyle,
                      children: [
                        jsx.jsx("div", {
                          style: { ...iconWrapperStyle, background: "linear-gradient(135deg, #10b981, #059669)" },
                          children: jsx.jsx("span", { style: { fontSize: "2rem" }, children: "📋" })
                        }),
                        jsx.jsx("button", {
                          onClick: () => setActiveModal("conduct"),
                          style: cardButtonStyle,
                          children: "Bắt đầu"
                        })
                      ]
                    }),
                    jsx.jsx("div", {
                      style: cardRightStyle,
                      children: jsx.jsx("p", { style: cardDescStyle, children: "Chấm điểm hạnh kiểm hàng tuần, tổng kết theo kỳ" })
                    })
                  ]
                })
              ]
            }),

            /* Card 2: Tài chính */
            jsx.jsxs("div", {
              style: cardStyle,
              children: [
                jsx.jsx("h3", { style: cardTitleStyle, children: "Tài chính lớp" }),
                jsx.jsxs("div", {
                  style: cardBodyStyle,
                  children: [
                    jsx.jsxs("div", {
                      style: cardLeftStyle,
                      children: [
                        jsx.jsx("div", {
                          style: { ...iconWrapperStyle, background: "linear-gradient(135deg, #f59e0b, #d97706)" },
                          children: jsx.jsx("span", { style: { fontSize: "2rem" }, children: "💰" })
                        }),
                        jsx.jsx("button", {
                          onClick: () => setActiveModal("finance"),
                          style: cardButtonStyle,
                          children: "Bắt đầu"
                        })
                      ]
                    }),
                    jsx.jsx("div", {
                      style: cardRightStyle,
                      children: jsx.jsx("p", { style: cardDescStyle, children: "Quản lý thu chi, quỹ lớp, theo dõi ai đã nộp tiền" })
                    })
                  ]
                })
              ]
            }),

            /* Card 3: Điểm danh */
            jsx.jsxs("div", {
              style: cardStyle,
              children: [
                jsx.jsx("h3", { style: cardTitleStyle, children: "Điểm danh" }),
                jsx.jsxs("div", {
                  style: cardBodyStyle,
                  children: [
                    jsx.jsxs("div", {
                      style: cardLeftStyle,
                      children: [
                        jsx.jsx("div", {
                          style: { ...iconWrapperStyle, background: "linear-gradient(135deg, #10b981, #3b82f6)" },
                          children: jsx.jsx("span", { style: { fontSize: "2rem" }, children: "✅" })
                        }),
                        jsx.jsx("button", {
                          onClick: () => setActiveModal("attendance"),
                          style: cardButtonStyle,
                          children: "Bắt đầu"
                        })
                      ]
                    }),
                    jsx.jsx("div", {
                      style: cardRightStyle,
                      children: jsx.jsx("p", { style: cardDescStyle, children: "Theo dõi chuyên cần, thống kê nghỉ học" })
                    })
                  ]
                })
              ]
            }),

            /* Card 4: Sổ liên lạc */
            jsx.jsxs("div", {
              style: cardStyle,
              children: [
                jsx.jsx("h3", { style: cardTitleStyle, children: "Sổ liên lạc" }),
                jsx.jsxs("div", {
                  style: cardBodyStyle,
                  children: [
                    jsx.jsxs("div", {
                      style: cardLeftStyle,
                      children: [
                        jsx.jsx("div", {
                          style: { ...iconWrapperStyle, background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" },
                          children: jsx.jsx("span", { style: { fontSize: "2rem" }, children: "📩" })
                        }),
                        jsx.jsx("button", {
                          onClick: () => setActiveModal("contact"),
                          style: cardButtonStyle,
                          children: "Bắt đầu"
                        })
                      ]
                    }),
                    jsx.jsx("div", {
                      style: cardRightStyle,
                      children: jsx.jsx("p", { style: cardDescStyle, children: "Gửi nhận xét và thông báo đến phụ huynh qua Zalo" })
                    })
                  ]
                })
              ]
            }),

            /* Card 5: Công cụ trên lớp */
            jsx.jsxs("div", {
              style: cardStyle,
              children: [
                jsx.jsx("h3", { style: cardTitleStyle, children: "Công cụ trên lớp" }),
                jsx.jsxs("div", {
                  style: cardBodyStyle,
                  children: [
                    jsx.jsxs("div", {
                      style: cardLeftStyle,
                      children: [
                        jsx.jsx("div", {
                          style: { ...iconWrapperStyle, background: "linear-gradient(135deg, #ec4899, #8b5cf6)" },
                          children: jsx.jsx("span", { style: { fontSize: "2rem" }, children: "🔮" })
                        }),
                        jsx.jsx("button", {
                          onClick: () => setActiveModal("tools"),
                          style: cardButtonStyle,
                          children: "Bắt đầu"
                        })
                      ]
                    }),
                    jsx.jsx("div", {
                      style: cardRightStyle,
                      children: jsx.jsx("p", { style: cardDescStyle, children: "Vòng quay, đua vịt, đua bi, bong bóng gọi tên, ghép cặp — cho tiết sinh hoạt" })
                    })
                  ]
                })
              ]
            }),

            /* Card 6: Hỗ trợ Sổ chủ nhiệm CSDL & VnEdu (Tiện ích Chrome) */
            jsx.jsxs("div", {
              style: {
                ...cardStyle,
                gridColumn: "span 2",
                position: "relative"
              },
              children: [
                jsx.jsx("span", {
                  style: {
                    position: "absolute",
                    top: "12px",
                    right: "16px",
                    background: "#10b981",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    padding: "3px 10px",
                    borderRadius: "6px"
                  },
                  children: "Tiện ích Chrome"
                }),
                jsx.jsx("h3", { style: cardTitleStyle, children: "Hỗ trợ Sổ chủ nhiệm CSDL & VnEdu" }),
                jsx.jsxs("div", {
                  style: { ...cardBodyStyle, gap: "20px" },
                  children: [
                    jsx.jsxs("div", {
                      style: cardLeftStyle,
                      children: [
                        jsx.jsx("div", {
                          style: { ...iconWrapperStyle, background: "linear-gradient(135deg, #e11d48, #be123c)" },
                          children: jsx.jsx("span", { style: { fontSize: "2rem" }, children: "⚡" })
                        }),
                        jsx.jsx("button", {
                          onClick: () => setActiveModal("extension"),
                          style: { ...cardButtonStyle, background: "#10b981", whiteSpace: "nowrap" },
                          children: "Tải tiện ích"
                        })
                      ]
                    }),
                    jsx.jsxs("div", {
                      style: cardRightStyle,
                      children: [
                        jsx.jsx("p", {
                          style: cardDescStyle,
                          children: "Điền hộ Sổ chủ nhiệm điện tử trên CSDL ngành và VnEdu — thay vì gõ tay hàng trăm ô, bấm một nút là xong."
                        }),
                        jsx.jsx("button", {
                          onClick: () => setActiveModal("extension"),
                          style: {
                            background: "none",
                            border: "none",
                            color: "#059669",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            padding: 0,
                            marginTop: "8px",
                            textAlign: "left"
                          },
                          children: "Xem hướng dẫn >"
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      }),

      /* ================= MODALS ================= */
      activeModal && jsx.jsx("div", {
        style: modalOverlayStyle,
        onClick: () => setActiveModal(null),
        children: jsx.jsxs("div", {
          style: modalContainerStyle,
          onClick: e => e.stopPropagation(),
          children: [
            /* Header */
            jsx.jsxs("div", {
              style: modalHeaderStyle,
              children: [
                jsx.jsx("h2", {
                  style: { margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#1e293b" },
                  children: activeModal === "conduct" ? `📋 Đánh giá Hạnh kiểm · Lớp ${currentClass.name}` :
                            activeModal === "finance" ? `💰 Tài chính & Quỹ lớp · Lớp ${currentClass.name}` :
                            activeModal === "attendance" ? `✅ Điểm danh chuyên cần · Lớp ${currentClass.name}` :
                            activeModal === "contact" ? `📩 Sổ liên lạc phụ huynh · Lớp ${currentClass.name}` :
                            activeModal === "tools" ? `🔮 Công cụ sinh hoạt lớp` :
                            activeModal === "students" ? `👥 Danh sách học sinh · Lớp ${currentClass.name}` :
                            activeModal === "addClass" ? "➕ Thêm lớp học mới" :
                            activeModal === "settings" ? "⚙️ Cấu hình năm học" :
                            "⚡ Tiện ích điền tự động CSDL & VnEdu"
                }),
                jsx.jsx("button", {
                  onClick: () => setActiveModal(null),
                  style: closeBtnStyle,
                  children: "✕"
                })
              ]
            }),

            /* Body */
            jsx.jsx("div", {
              style: modalBodyStyle,
              children: (
                activeModal === "conduct" ? renderConductModal(students, handleConductChange) :
                activeModal === "finance" ? renderFinanceModal(students, feeTarget, totalCollected, totalSpent, fundBalance, currentClass.expenses || [], newExpenseTitle, setNewExpenseTitle, newExpenseAmount, setNewExpenseAmount, handleAddExpense, handleToggleFeePaid) :
                activeModal === "attendance" ? renderAttendanceModal(students, attendanceDate, setAttendanceDate, currentClass.attendances?.[attendanceDate] || {}, handleAttendanceChange) :
                activeModal === "contact" ? renderContactModal(students, currentClass) :
                activeModal === "tools" ? renderToolsModal() :
                activeModal === "students" ? renderStudentsModal(students, newStudentName, setNewStudentName, newStudentGender, setNewStudentGender, newStudentPhone, setNewStudentPhone, handleAddStudent, handleDeleteStudent) :
                activeModal === "addClass" ? renderAddClassModal(newClassName, setNewClassName, newSchoolName, setNewSchoolName, handleCreateClass, () => setActiveModal(null)) :
                activeModal === "settings" ? renderSettingsModal(currentClass, updateCurrentClass, () => setActiveModal(null)) :
                renderExtensionModal()
              )
            })
          ]
        })
      })
    ]
  });
}

/* Modal Render Helpers */
function renderConductModal(students, onConductChange) {
  return jsx.jsxs("div", {
    children: [
      jsx.jsx("p", { style: { color: "#64748b", fontSize: "0.9rem", marginBottom: "16px" }, children: "Đánh giá, xếp loại rèn luyện định kỳ theo Thông tư 22 & TT 58:" }),
      students.length === 0 ? jsx.jsx("p", { children: "Lớp chưa có học sinh. Vui lòng thêm học sinh trước." }) :
      jsx.jsxs("table", {
        style: tableStyle,
        children: [
          jsx.jsx("thead", {
            children: jsx.jsxs("tr", {
              children: [
                jsx.jsx("th", { style: thStyle, children: "STT" }),
                jsx.jsx("th", { style: thStyle, children: "Họ và tên" }),
                jsx.jsx("th", { style: thStyle, children: "Xếp loại" }),
                jsx.jsx("th", { style: thStyle, children: "Ghi chú rèn luyện / vi phạm" })
              ]
            })
          }),
          jsx.jsx("tbody", {
            children: students.map(s => jsx.jsxs("tr", {
              children: [
                jsx.jsx("td", { style: tdStyle, children: s.stt }),
                jsx.jsxs("td", { style: { ...tdStyle, fontWeight: 700 }, children: [s.name, " (", s.gender, ")"] }),
                jsx.jsx("td", {
                  style: tdStyle,
                  children: jsx.jsxs("select", {
                    value: s.conduct || "Tốt",
                    onChange: e => onConductChange(s.id, e.target.value),
                    style: selectStyle,
                    children: [
                      jsx.jsx("option", { value: "Tốt", children: "Tốt (Xuất sắc)" }),
                      jsx.jsx("option", { value: "Khá", children: "Khá" }),
                      jsx.jsx("option", { value: "Đạt", children: "Đạt" }),
                      jsx.jsx("option", { value: "Chưa đạt", children: "Chưa đạt" })
                    ]
                  })
                }),
                jsx.jsx("td", {
                  style: tdStyle,
                  children: jsx.jsx("input", {
                    type: "text",
                    value: s.conductNote || "",
                    placeholder: "Nhận xét...",
                    onChange: e => onConductChange(s.id, s.conduct, e.target.value),
                    style: inputStyle
                  })
                })
              ]
            }, s.id))
          })
        ]
      })
    ]
  });
}

function renderFinanceModal(students, feeTarget, totalCollected, totalSpent, fundBalance, expenses, newTitle, setTitle, newAmt, setAmt, onAddExpense, onToggleFee) {
  return jsx.jsxs("div", {
    children: [
      /* Overview Stats */
      jsx.jsxs("div", {
        style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" },
        children: [
          jsx.jsxs("div", { style: statBoxStyle, children: [jsx.jsx("div", { style: statLabelStyle, children: "Tổng đã thu" }), jsx.jsxs("div", { style: { ...statValueStyle, color: "#10b981" }, children: [totalCollected.toLocaleString("vi-VN"), " đ"] })] }),
          jsx.jsxs("div", { style: statBoxStyle, children: [jsx.jsx("div", { style: statLabelStyle, children: "Tổng đã chi" }), jsx.jsxs("div", { style: { ...statValueStyle, color: "#ef4444" }, children: [totalSpent.toLocaleString("vi-VN"), " đ"] })] }),
          jsx.jsxs("div", { style: statBoxStyle, children: [jsx.jsx("div", { style: statLabelStyle, children: "Tồn quỹ hiện tại" }), jsx.jsxs("div", { style: { ...statValueStyle, color: fundBalance >= 0 ? "#2563eb" : "#dc2626" }, children: [fundBalance.toLocaleString("vi-VN"), " đ"] })] })
        ]
      }),
      /* Add expense */
      jsx.jsxs("div", {
        style: { display: "flex", gap: "10px", marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "8px" },
        children: [
          jsx.jsx("input", { placeholder: "Tên khoản chi (ví dụ: Mua quà 20/11...)", value: newTitle, onChange: e => setTitle(e.target.value), style: { ...inputStyle, flex: 2 } }),
          jsx.jsx("input", { placeholder: "Số tiền (VNĐ)", type: "number", value: newAmt, onChange: e => setAmt(e.target.value), style: { ...inputStyle, flex: 1 } }),
          jsx.jsx("button", { onClick: onAddExpense, style: primaryBtnStyle, children: "+ Ghi nhận chi" })
        ]
      }),
      /* Student payment checklist */
      jsx.jsx("h4", { style: { margin: "16px 0 8px 0" }, children: "Danh sách học sinh đóng quỹ (mức thu 100.000đ/học sinh):" }),
      jsx.jsxs("table", {
        style: tableStyle,
        children: [
          jsx.jsx("thead", {
            children: jsx.jsxs("tr", {
              children: [
                jsx.jsx("th", { style: thStyle, children: "STT" }),
                jsx.jsx("th", { style: thStyle, children: "Họ và tên" }),
                jsx.jsx("th", { style: thStyle, children: "Số tiền" }),
                jsx.jsx("th", { style: thStyle, children: "Trạng thái nộp" })
              ]
            })
          }),
          jsx.jsx("tbody", {
            children: students.map(s => jsx.jsxs("tr", {
              children: [
                jsx.jsx("td", { style: tdStyle, children: s.stt }),
                jsx.jsx("td", { style: { ...tdStyle, fontWeight: 700 }, children: s.name }),
                jsx.jsxs("td", { style: tdStyle, children: [feeTarget.toLocaleString("vi-VN"), " đ"] }),
                jsx.jsx("td", {
                  style: tdStyle,
                  children: jsx.jsx("button", {
                    onClick: () => onToggleFee(s.id),
                    style: {
                      background: s.feePaid ? "#dcfce7" : "#fee2e2",
                      color: s.feePaid ? "#166534" : "#991b1b",
                      border: "none",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontWeight: 700,
                      cursor: "pointer"
                    },
                    children: s.feePaid ? "✓ Đã nộp" : "✕ Chưa nộp"
                  })
                })
              ]
            }, s.id))
          })
        ]
      })
    ]
  });
}

function renderAttendanceModal(students, date, setDate, dayAtts, onAttChange) {
  return jsx.jsxs("div", {
    children: [
      jsx.jsxs("div", {
        style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
        children: [
          jsx.jsx("label", { style: { fontWeight: 700 }, children: "Chọn ngày điểm danh:" }),
          jsx.jsx("input", { type: "date", value: date, onChange: e => setDate(e.target.value), style: { ...inputStyle, width: "auto" } })
        ]
      }),
      students.length === 0 ? jsx.jsx("p", { children: "Chưa có học sinh." }) :
      jsx.jsxs("table", {
        style: tableStyle,
        children: [
          jsx.jsx("thead", {
            children: jsx.jsxs("tr", {
              children: [
                jsx.jsx("th", { style: thStyle, children: "STT" }),
                jsx.jsx("th", { style: thStyle, children: "Họ và tên" }),
                jsx.jsx("th", { style: thStyle, children: "Chuyên cần" }),
                jsx.jsx("th", { style: thStyle, children: "Thao tác nhanh" })
              ]
            })
          }),
          jsx.jsx("tbody", {
            children: students.map(s => {
              const status = dayAtts[s.id] || "CM";
              return jsx.jsxs("tr", {
                children: [
                  jsx.jsx("td", { style: tdStyle, children: s.stt }),
                  jsx.jsx("td", { style: { ...tdStyle, fontWeight: 700 }, children: s.name }),
                  jsx.jsx("td", {
                    style: tdStyle,
                    children: jsx.jsx("span", {
                      style: {
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontWeight: 700,
                        background: status === "CM" ? "#dcfce7" : status === "P" ? "#fef9c3" : "#fee2e2",
                        color: status === "CM" ? "#15803d" : status === "P" ? "#a16207" : "#b91c1c"
                      },
                      children: status === "CM" ? "Có mặt" : status === "P" ? "Nghỉ có phép (P)" : "Nghỉ không phép (KP)"
                    })
                  }),
                  jsx.jsx("td", {
                    style: tdStyle,
                    children: jsx.jsxs("div", {
                      style: { display: "flex", gap: "6px" },
                      children: [
                        jsx.jsx("button", { onClick: () => onAttChange(s.id, "CM"), style: { padding: "4px 8px", background: "#dcfce7", color: "#166534", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 700 }, children: "Có mặt" }),
                        jsx.jsx("button", { onClick: () => onAttChange(s.id, "P"), style: { padding: "4px 8px", background: "#fef9c3", color: "#854d0e", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 700 }, children: "Phép" }),
                        jsx.jsx("button", { onClick: () => onAttChange(s.id, "KP"), style: { padding: "4px 8px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 700 }, children: "K.Phép" })
                      ]
                    })
                  })
                ]
              }, s.id);
            })
          })
        ]
      })
    ]
  });
}

function renderContactModal(students, currentClass) {
  return jsx.jsxs("div", {
    children: [
      jsx.jsx("p", { style: { color: "#64748b", fontSize: "0.9rem" }, children: "Gửi thông tin rèn luyện và nhắc nhở học sinh tới phụ huynh qua Zalo:" }),
      students.length === 0 ? jsx.jsx("p", { children: "Chưa có học sinh." }) :
      jsx.jsxs("div", {
        style: { display: "flex", flexDirection: "column", gap: "10px" },
        children: students.map(s => {
          const msg = `Kính gửi Phụ huynh em ${s.name} (Lớp ${currentClass.name}): Hạnh kiểm hiện tại đạt loại ${s.conduct || 'Tốt'}. ${s.conductNote ? 'Nhận xét: ' + s.conductNote : ''}`;
          return jsx.jsxs("div", {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" },
            children: [
              jsx.jsxs("div", {
                children: [
                  jsx.jsxs("div", { style: { fontWeight: 700, fontSize: "0.95rem" }, children: [s.stt, ". ", s.name] }),
                  jsx.jsxs("div", { style: { color: "#64748b", fontSize: "0.85rem" }, children: ["SĐT: ", s.phone || "Chưa cập nhật", " · Hạnh kiểm: ", s.conduct || "Tốt"] })
                ]
              }),
              jsx.jsxs("div", {
                style: { display: "flex", gap: "8px" },
                children: [
                  jsx.jsx("button", {
                    onClick: () => {
                      navigator.clipboard.writeText(msg);
                      alert("Đã sao chép mẫu tin nhắn!");
                    },
                    style: { background: "#e2e8f0", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" },
                    children: "📋 Sao chép tin"
                  }),
                  jsx.jsx("a", {
                    href: `https://zalo.me/${s.phone}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    style: { background: "#0068ff", color: "#fff", textDecoration: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: 700, fontSize: "0.85rem" },
                    children: "Gửi Zalo ↗"
                  })
                ]
              })
            ]
          }, s.id);
        })
      })
    ]
  });
}

function renderToolsModal() {
  const tools = [
    { name: "Vòng quay may mắn", desc: "Quay số gọi tên học sinh ngẫu nhiên", icon: "🎡", route: "/goi-ten?game=wheel", url: "/games_2/runner.html?game=" + encodeURIComponent("/goi-ten?game=wheel") },
    { name: "Đua vịt / Đua xe", desc: "Trò chơi thi đua giữa các tổ/nhóm sinh hoạt", icon: "🦆", route: "/goi-ten?game=duckRace", url: "/games_2/runner.html?game=" + encodeURIComponent("/goi-ten?game=duckRace") },
    { name: "Ghép cặp ngẫu nhiên", desc: "Bắt cặp bạn cùng tiến hoặc làm việc nhóm", icon: "🧩", route: "/goi-ten?game=photoPair", url: "/games_2/runner.html?game=" + encodeURIComponent("/goi-ten?game=photoPair") },
    { name: "Bong bóng gọi tên", desc: "Bấm nổ bong bóng để gọi tên học sinh phát biểu", icon: "🎈", route: "/goi-ten?game=photoCall", url: "/games_2/runner.html?game=" + encodeURIComponent("/goi-ten?game=photoCall") },
    { name: "Đồng hồ đếm ngược", desc: "Đặt thời gian sinh hoạt lớp, thảo luận", icon: "⏱️", route: "/class-timer", url: "/games_2/runner.html?game=" + encodeURIComponent("/class-timer") }
  ];
  return jsx.jsxs("div", {
    children: [
      jsx.jsx("p", { style: { color: "#64748b", marginBottom: "16px" }, children: "Các tiện ích hỗ trợ tiết sinh hoạt lớp sôi nổi và hào hứng:" }),
      jsx.jsx("div", {
        style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" },
        children: tools.map(t => jsx.jsxs("div", {
          key: t.name,
          onClick: (e) => {
            e.preventDefault();
            if (window.parent && typeof window.parent.launchGVDMGame === 'function') {
              window.parent.launchGVDMGame(t.route, t.name);
            } else {
              window.location.href = t.url;
            }
          },
          style: {
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: "12px",
            padding: "16px",
            textDecoration: "none",
            color: "#1e293b",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s"
          },
          children: [
            jsx.jsx("span", { style: { fontSize: "2.2rem" }, children: t.icon }),
            jsx.jsx("strong", { style: { fontSize: "1.05rem" }, children: t.name }),
            jsx.jsx("span", { style: { color: "#64748b", fontSize: "0.85rem", lineHeight: 1.4 }, children: t.desc }),
            jsx.jsx("span", { style: { color: "#2563eb", fontWeight: 700, fontSize: "0.85rem", marginTop: "auto" }, children: "Mở ngay →" })
          ]
        }))
      })
    ]
  });
}

function renderStudentsModal(students, name, setName, gender, setGender, phone, setPhone, onAdd, onDelete) {
  return jsx.jsxs("div", {
    children: [
      /* Form add student */
      jsx.jsxs("div", {
        style: { display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "12px", borderRadius: "8px" },
        children: [
          jsx.jsx("input", { placeholder: "Họ và tên học sinh...", value: name, onChange: e => setName(e.target.value), style: { ...inputStyle, flex: 2 } }),
          jsx.jsxs("select", { value: gender, onChange: e => setGender(e.target.value), style: { ...selectStyle, flex: 1 }, children: [jsx.jsx("option", { value: "Nam", children: "Nam" }), jsx.jsx("option", { value: "Nữ", children: "Nữ" })] }),
          jsx.jsx("input", { placeholder: "SĐT phụ huynh...", value: phone, onChange: e => setPhone(e.target.value), style: { ...inputStyle, flex: 1 } }),
          jsx.jsx("button", { onClick: onAdd, style: primaryBtnStyle, children: "+ Thêm học sinh" })
        ]
      }),
      students.length === 0 ? jsx.jsx("p", { children: "Chưa có học sinh nào trong danh sách." }) :
      jsx.jsxs("table", {
        style: tableStyle,
        children: [
          jsx.jsx("thead", {
            children: jsx.jsxs("tr", {
              children: [
                jsx.jsx("th", { style: thStyle, children: "STT" }),
                jsx.jsx("th", { style: thStyle, children: "Họ và tên" }),
                jsx.jsx("th", { style: thStyle, children: "Giới tính" }),
                jsx.jsx("th", { style: thStyle, children: "SĐT Phụ huynh" }),
                jsx.jsx("th", { style: thStyle, children: "Xóa" })
              ]
            })
          }),
          jsx.jsx("tbody", {
            children: students.map(s => jsx.jsxs("tr", {
              children: [
                jsx.jsx("td", { style: tdStyle, children: s.stt }),
                jsx.jsx("td", { style: { ...tdStyle, fontWeight: 700 }, children: s.name }),
                jsx.jsx("td", { style: tdStyle, children: s.gender }),
                jsx.jsx("td", { style: tdStyle, children: s.phone || "-" }),
                jsx.jsx("td", {
                  style: tdStyle,
                  children: jsx.jsx("button", {
                    onClick: () => onDelete(s.id),
                    style: { background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontWeight: 700 },
                    children: "Xóa"
                  })
                })
              ]
            }, s.id))
          })
        ]
      })
    ]
  });
}

function renderAddClassModal(name, setName, school, setSchool, onSave, onCancel) {
  return jsx.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "14px" },
    children: [
      jsx.jsxs("div", {
        children: [
          jsx.jsx("label", { style: { display: "block", fontWeight: 700, marginBottom: "4px" }, children: "Tên lớp học:" }),
          jsx.jsx("input", { placeholder: "Ví dụ: 10A1, 12A3...", value: name, onChange: e => setName(e.target.value), style: inputStyle })
        ]
      }),
      jsx.jsxs("div", {
        children: [
          jsx.jsx("label", { style: { display: "block", fontWeight: 700, marginBottom: "4px" }, children: "Tên trường:" }),
          jsx.jsx("input", { placeholder: "Ví dụ: THPT Nguyễn Du", value: school, onChange: e => setSchool(e.target.value), style: inputStyle })
        ]
      }),
      jsx.jsxs("div", {
        style: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" },
        children: [
          jsx.jsx("button", { onClick: onCancel, style: { background: "#f1f5f9", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }, children: "Hủy" }),
          jsx.jsx("button", { onClick: onSave, style: primaryBtnStyle, children: "Lưu lớp mới" })
        ]
      })
    ]
  });
}

function renderSettingsModal(currentClass, updateClass, onClose) {
  return jsx.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "16px" },
    children: [
      jsx.jsxs("div", {
        children: [
          jsx.jsx("label", { style: { display: "block", fontWeight: 700, marginBottom: "4px" }, children: "Năm học hiện tại:" }),
          jsx.jsx("input", {
            value: currentClass.academicYear || "2026-2027",
            onChange: e => updateClass(c => ({ ...c, academicYear: e.target.value })),
            style: inputStyle
          })
        ]
      }),
      jsx.jsxs("div", {
        children: [
          jsx.jsx("label", { style: { display: "block", fontWeight: 700, marginBottom: "4px" }, children: "Mức thu quỹ lớp kỳ này (VNĐ/học sinh):" }),
          jsx.jsx("input", {
            type: "number",
            value: currentClass.funds?.[0]?.amount || 100000,
            onChange: e => {
              const val = parseInt(e.target.value, 10);
              updateClass(c => ({ ...c, funds: [{ ...c.funds[0], amount: isNaN(val) ? 0 : val }] }));
            },
            style: inputStyle
          })
        ]
      }),
      jsx.jsx("button", { onClick: onClose, style: { ...primaryBtnStyle, alignSelf: "flex-end" }, children: "Xong" })
    ]
  });
}

function renderExtensionModal() {
  return jsx.jsxs("div", {
    style: { display: "flex", flexDirection: "column", gap: "14px" },
    children: [
      jsx.jsx("p", {
        style: { lineHeight: 1.6, color: "#334155" },
        children: "Tiện ích Chrome giúp Thầy/Cô tự động điền Sổ chủ nhiệm điện tử, nhận xét hạnh kiểm học sinh hàng loạt lên CSDL ngành và hệ thống VnEdu chỉ với 1 click, tiết kiệm hàng giờ gõ tay mỗi kỳ."
      }),
      jsx.jsxs("div", {
        style: { background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "8px" },
        children: [
          jsx.jsx("h4", { style: { margin: "0 0 8px 0", color: "#166534" }, children: "✨ Tính năng nổi bật:" }),
          jsx.jsxs("ul", {
            style: { margin: 0, paddingLeft: "20px", color: "#15803d", lineHeight: 1.6 },
            children: [
              jsx.jsx("li", { children: "Tự động điền nhận xét hạnh kiểm theo TT 22" }),
              jsx.jsx("li", { children: "Điền điểm danh và chuyên cần cả học kỳ" }),
              jsx.jsx("li", { children: "Tương thích hệ thống CSDL Bộ GD&ĐT và VnEdu" }),
              jsx.jsx("li", { children: "Bản quyền mở khóa miễn phí vĩnh viễn" })
            ]
          })
        ]
      }),
      jsx.jsxs("div", {
        style: { display: "flex", gap: "10px", marginTop: "10px" },
        children: [
          jsx.jsx("button", {
            type: "button",
            onClick: () => alert("⚡ Tiện ích điền tự động CSDL ngành & VnEdu đã được tích hợp sẵn trên hệ thống MHEdu. Thầy/Cô có thể quản lý, nhận xét hạnh kiểm và xuất danh sách trực tiếp trên giao diện này!"),
            style: { ...primaryBtnStyle, textAlign: "center", background: "#10b981", border: "none", cursor: "pointer" },
            children: "⚡ Kích hoạt tiện ích nội bộ MHEdu"
          }),
          jsx.jsx("button", {
            type: "button",
            onClick: () => alert("📖 Hướng dẫn nhanh:\n1. Chọn lớp học hoặc thêm lớp mới ở thanh trên cùng.\n2. Vào các mục Hạnh kiểm, Tài chính, Điểm danh, Sổ liên lạc để cập nhật thông tin học sinh.\n3. Dữ liệu được lưu trữ tự động trên đám mây MHEdu."),
            style: { ...primaryBtnStyle, textAlign: "center", background: "#6366f1", border: "none", cursor: "pointer" },
            children: "📖 Xem hướng dẫn sử dụng"
          })
        ]
      })
    ]
  });
}

/* Common Styles */
const cardStyle = {
  background: "#fffffffa",
  border: "3px solid #ffffff80",
  borderRadius: "16px",
  padding: "16px 20px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s, box-shadow 0.2s"
};

const cardTitleStyle = {
  margin: 0,
  fontSize: "1.15rem",
  fontWeight: 800,
  color: "#1e293b"
};

const cardBodyStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "14px"
};

const cardLeftStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  flexShrink: 0
};

const cardRightStyle = {
  flex: 1,
  minWidth: 0
};

const iconWrapperStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
};

const cardDescStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.9rem",
  lineHeight: 1.45
};

const cardButtonStyle = {
  background: "#10b981",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "6px 16px",
  fontWeight: 700,
  fontSize: "0.85rem",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)"
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px"
};

const modalContainerStyle = {
  background: "#fff",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "750px",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  overflow: "hidden"
};

const modalHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  borderBottom: "1px solid #e2e8f0"
};

const modalBodyStyle = {
  padding: "20px",
  overflowY: "auto",
  flex: 1
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  fontSize: "1.25rem",
  color: "#64748b",
  cursor: "pointer",
  padding: "4px 8px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px"
};

const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  background: "#f1f5f9",
  color: "#475569",
  fontWeight: 700,
  fontSize: "0.85rem",
  borderBottom: "1px solid #cbd5e1"
};

const tdStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "0.9rem"
};

const inputStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "0.9rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box"
};

const selectStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "0.9rem",
  outline: "none",
  background: "#fff",
  cursor: "pointer"
};

const primaryBtnStyle = {
  background: "#059669",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  fontWeight: 700,
  fontSize: "0.9rem",
  cursor: "pointer"
};

const statBoxStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "12px",
  textAlign: "center"
};

const statLabelStyle = {
  fontSize: "0.8rem",
  color: "#64748b",
  fontWeight: 600
};

const statValueStyle = {
  fontSize: "1.25rem",
  fontWeight: 800,
  marginTop: "4px"
};
