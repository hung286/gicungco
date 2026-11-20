/* =========================================================
 * SCRIPT BẢO VỆ CHỐNG NHÚNG TRỰC TIẾP / HOTLINK
 * ========================================================= */
(function () {
    // Các tên miền gốc được phép gọi game của bạn
   const ALLOWED_ORIGINS = [
        "edunovavn.vercel.app",        
        "giaovien8888.vercel.app",
        "khogamehoctap.vercel.app"
    ];

    const HOME_URL = "https://khogamehoctap.vercel.app/";
    // Cho phép chạy test trên máy cá nhân hoặc qua Live Server
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "") return;

    let authorized = false;

    try {
        const referrer = document.referrer;

        if (referrer) {
            const referrerUrl = new URL(referrer);

            authorized =
                referrerUrl.protocol === "https:" &&
                ALLOWED_ORIGINS.includes(referrerUrl.hostname);
        }
    } catch (e) {
        authorized = false;
    }

    // Nếu không xuất phát từ 2 trang web cho phép, đá về trang chủ
    if (!authorized) {
        window.location.replace(HOME_URL + "?ref=blocked");
    }
})();
