import{r as React,j as jsxRuntimeExports}from"./vendor-react-Cg7KvPel.js";
import{H as AppHeader,I as LandingHeader,J as Link,S as SEOHead,a as useAuth}from"./index-DnvAnRgE.js";

function DonateCoffeePage() {
  const { currentUser } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText("6320495851");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      window.prompt("Sao chép số tài khoản:", "6320495851");
    }
  };

  return jsxRuntimeExports.jsxs("div", {
    className: currentUser ? "shop-page" : "shop-page shop-page--guest",
    style: { minHeight: "100vh", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)", color: "#1f2937" },
    children: [
      jsxRuntimeExports.jsx(SEOHead, {
        title: "Mời tác giả ly cà phê | MHEdu",
        description: "Ủng hộ tác giả MHEdu để tiếp thêm động lực phát triển thêm nhiều trò chơi dạy học, bài giảng và công cụ AI miễn phí.",
        keywords: "mhedu, ung ho, moi ca phe, thay nguyen manh hung, doiten234",
        canonicalUrl: "https://mhedu.vercel.app/mua-goi"
      }),
      currentUser ? jsxRuntimeExports.jsx(AppHeader, {}) : jsxRuntimeExports.jsx(LandingHeader, {}),
      jsxRuntimeExports.jsx("main", {
        className: "shop-main",
        style: { maxWidth: 860, margin: "0 auto", padding: "88px 16px 60px", minHeight: "85vh" },
        children: jsxRuntimeExports.jsxs("div", {
          style: { display: "flex", flexDirection: "column", alignItems: "center" },
          children: [
            jsxRuntimeExports.jsxs("div", {
              style: { textAlign: "center", marginBottom: 28 },
              children: [
                jsxRuntimeExports.jsx("div", {
                  style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255, 255, 255, 0.22)",
                    backdropFilter: "blur(10px)",
                    color: "#fff",
                    padding: "6px 20px",
                    borderRadius: 30,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    marginBottom: 14,
                    border: "1px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                  },
                  children: "☕ Tấm Lòng Giáo Viên — Đồng Hành Cùng MHEdu"
                }),
                jsxRuntimeExports.jsx("h1", {
                  style: {
                    margin: "0 0 14px",
                    fontSize: "2.3rem",
                    fontWeight: 900,
                    color: "#fff",
                    textShadow: "0 3px 15px rgba(0,0,0,0.25)"
                  },
                  children: "Mời Tác Giả Ly Cà Phê"
                }),
                jsxRuntimeExports.jsxs("p", {
                  style: {
                    margin: "0 auto",
                    maxWidth: 620,
                    color: "rgba(255,255,255,0.95)",
                    fontSize: "1.05rem",
                    lineHeight: 1.65
                  },
                  children: [
                    "Toàn bộ ",
                    jsxRuntimeExports.jsx("b", { children: "Game tương tác" }),
                    ", ",
                    jsxRuntimeExports.jsx("b", { children: "Công cụ AI" }),
                    " và ",
                    jsxRuntimeExports.jsx("b", { children: "Mô phỏng bài dạy" }),
                    " trên nền tảng ",
                    jsxRuntimeExports.jsx("b", { children: "MHEdu" }),
                    " được mở khóa hoàn toàn ",
                    jsxRuntimeExports.jsx("b", { style: { color: "#fef08a" }, children: "MIỄN PHÍ" }),
                    " phục vụ Thầy/Cô đổi mới phương pháp giảng dạy.",
                    jsxRuntimeExports.jsx("br", {}),
                    "Nếu thấy nền tảng hữu ích, Thầy/Cô có thể mời tác giả một ly cà phê ấm lòng để tiếp sức duy trì máy chủ và phát triển thêm tính năng mới!"
                  ]
                })
              ]
            }),
            jsxRuntimeExports.jsxs("div", {
              style: {
                background: "#ffffff",
                borderRadius: 24,
                padding: "32px 24px",
                boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
                maxWidth: 520,
                width: "100%",
                textAlign: "center"
              },
              children: [
                jsxRuntimeExports.jsx("img", {
                  src: "/images/donate_qr.jpg",
                  alt: "Mã VietQR BIDV - Nguyễn Mạnh Hùng",
                  style: {
                    width: 320,
                    maxWidth: "100%",
                    borderRadius: 18,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    margin: "0 auto 20px",
                    display: "block",
                    border: "1px solid #e2e8f0"
                  }
                }),
                jsxRuntimeExports.jsxs("div", {
                  style: {
                    background: "#f8fafc",
                    borderRadius: 16,
                    padding: "18px 20px",
                    border: "1.5px solid #e2e8f0",
                    textAlign: "left",
                    marginBottom: 20
                  },
                  children: [
                    jsxRuntimeExports.jsxs("div", {
                      style: { marginBottom: 10 },
                      children: [
                        jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", color: "#64748b", display: "block" }, children: "Ngân hàng:" }),
                        jsxRuntimeExports.jsx("strong", { style: { color: "#0f172a", fontSize: "1.02rem" }, children: "BIDV - Ngân hàng TMCP Đầu tư & Phát triển Việt Nam" })
                      ]
                    }),
                    jsxRuntimeExports.jsxs("div", {
                      style: { marginBottom: 10 },
                      children: [
                        jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", color: "#64748b", display: "block" }, children: "Chủ tài khoản:" }),
                        jsxRuntimeExports.jsx("strong", { style: { color: "#0f172a", fontSize: "1.05rem" }, children: "NGUYEN MANH HUNG" })
                      ]
                    }),
                    jsxRuntimeExports.jsxs("div", {
                      style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 },
                      children: [
                        jsxRuntimeExports.jsxs("div", {
                          children: [
                            jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", color: "#64748b", display: "block" }, children: "Số tài khoản:" }),
                            jsxRuntimeExports.jsx("strong", { style: { color: "#2563eb", fontSize: "1.3rem", letterSpacing: "1px", fontFamily: "monospace" }, children: "6320495851" })
                          ]
                        }),
                        jsxRuntimeExports.jsx("button", {
                          onClick: copyAccountNumber,
                          type: "button",
                          style: {
                            background: copied ? "#10b981" : "#4f46e5",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 14px",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          },
                          children: copied ? "✓ Đã sao chép!" : "📋 Sao chép STK"
                        })
                      ]
                    }),
                    jsxRuntimeExports.jsxs("div", {
                      children: [
                        jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", color: "#64748b", display: "block" }, children: "Nội dung chuyển khoản (gợi ý):" }),
                        jsxRuntimeExports.jsx("code", { style: { background: "#e2e8f0", padding: "2px 8px", borderRadius: 4, color: "#334155", fontSize: "0.95rem" }, children: "Moi cafe MHEdu [Tên Thầy/Cô]" })
                      ]
                    })
                  ]
                }),
                jsxRuntimeExports.jsxs("div", {
                  style: {
                    background: "#f0fdf4",
                    borderRadius: 14,
                    padding: "14px 16px",
                    border: "1px solid #bbf7d0",
                    marginBottom: 20,
                    textAlign: "center"
                  },
                  children: [
                    jsxRuntimeExports.jsx("div", { style: { fontSize: "0.9rem", color: "#166534", fontWeight: 600, marginBottom: 8 }, children: "📞 Kênh liên hệ & Giao lưu cùng tác giả:" }),
                    jsxRuntimeExports.jsxs("div", {
                      style: { display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", fontSize: "0.93rem" },
                      children: [
                        jsxRuntimeExports.jsxs("a", {
                          href: "https://zalo.me/0965908084",
                          target: "_blank",
                          rel: "noopener noreferrer",
                          style: { color: "#0284c7", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 },
                          children: ["💬 Zalo: 0965.908.084"]
                        }),
                        jsxRuntimeExports.jsxs("a", {
                          href: "https://www.facebook.com/doiten234",
                          target: "_blank",
                          rel: "noopener noreferrer",
                          style: { color: "#1877f2", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 },
                          children: ["📘 Facebook"]
                        }),
                        jsxRuntimeExports.jsxs("a", {
                          href: "mailto:hungvd286@gmail.com",
                          style: { color: "#ea580c", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 },
                          children: ["✉️ hungvd286@gmail.com"]
                        })
                      ]
                    })
                  ]
                }),
                jsxRuntimeExports.jsxs("div", {
                  style: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
                  children: [
                    jsxRuntimeExports.jsx(Link, {
                      to: "/",
                      style: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 20px",
                        background: "#4f46e5",
                        color: "#fff",
                        borderRadius: 10,
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "0.95rem"
                      },
                      children: "🏠 Về Trang Chủ"
                    }),
                    jsxRuntimeExports.jsx(Link, {
                      to: "/ai-tools",
                      style: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 20px",
                        background: "#f1f5f9",
                        color: "#334155",
                        borderRadius: 10,
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        border: "1px solid #cbd5e1"
                      },
                      children: "✨ Công Cụ AI"
                    })
                  ]
                })
              ]
            })
          ]
        })
      })
    ]
  });
}

export { DonateCoffeePage as default };
