/**
 * MHEdu - SCORM 1.2 Packager & HTML Exporter
 * Đóng gói mini-game thành gói SCORM 1.2 chuẩn quốc tế (tương thích K12Online, vnEdu, Moodle, Canvas)
 * Tác giả: NMH Thầy Nguyễn Mạnh Hùng
 */

export function sanitizeFilename(name) {
  return String(name || "MHEdu_Game")
    .replace(/[^\p{L}\p{N}._-]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "MHEdu_Game";
}

export function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateScormManifest(gameTitle) {
  const safeTitle = escapeXml(gameTitle || "MHEdu Game");
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="vn.smartedu.aigame" version="1"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="smartedu_org">
    <organization identifier="smartedu_org">
      <title>${safeTitle}</title>
      <item identifier="item_1" identifierref="resource_1">
        <title>${safeTitle}</title>
        <adlcp:masteryscore>50</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`;
}

export const SCORM_TRACKING_SCRIPT = `<script id="smartedu-scorm-bridge">
(function(){
  var api = null, w = window, n = 0;
  try {
    while (w && !w.API && w.parent && w.parent !== w && n < 10) {
      w = w.parent;
      n++;
    }
    api = w.API || null;
  } catch(e) {}
  if (!api) {
    try { api = window.opener && window.opener.API || null; } catch(e) {}
  }
  function call(f, a, b) {
    try { return api && api[f] ? api[f](a, b) : ""; } catch(e) { return ""; }
  }
  call("LMSInitialize", "");
  if (call("LMSGetValue", "cmi.core.lesson_status") === "not attempted") {
    call("LMSSetValue", "cmi.core.lesson_status", "incomplete");
  }
  call("LMSCommit", "");

  function reportComplete(data) {
    if (!data || data.type !== "GAME_COMPLETE") return;
    var max = Number(data.maxScore) || 100;
    var s = Number(data.score) || 0;
    var pct = max > 0 ? Math.round(s / max * 100) : 100;
    call("LMSSetValue", "cmi.core.score.min", "0");
    call("LMSSetValue", "cmi.core.score.max", "100");
    call("LMSSetValue", "cmi.core.score.raw", String(Math.max(0, Math.min(100, pct))));
    call("LMSSetValue", "cmi.core.lesson_status", pct >= 50 ? "passed" : "failed");
    call("LMSCommit", "");
    call("LMSFinish", "");
  }

  // Lắng nghe tín hiệu hoàn thành từ game
  window.addEventListener("message", function(e) {
    if (e && e.data && e.data.type === "GAME_COMPLETE") {
      reportComplete(e.data);
    }
  });

  // Hỗ trợ hook trực tiếp window.parent.postMessage
  var origPostMessage = window.parent.postMessage;
  try {
    window.parent.postMessage = function(m, t) {
      reportComplete(m);
      if (origPostMessage) {
        try { origPostMessage.call(window.parent, m, t); } catch(err) {}
      }
    };
  } catch(e) {}
})();
</script>`;

export function injectScormIntoHtml(html) {
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    return html.replace(headMatch[0], headMatch[0] + "\n" + SCORM_TRACKING_SCRIPT);
  }
  const htmlMatch = html.match(/<html[^>]*>/i);
  if (htmlMatch) {
    return html.replace(htmlMatch[0], htmlMatch[0] + "\n<head>" + SCORM_TRACKING_SCRIPT + "</head>");
  }
  return "<head>" + SCORM_TRACKING_SCRIPT + "</head>\n" + html;
}

export async function createScormPackage(htmlContent, gameTitle) {
  if (!window.JSZip) {
    throw new Error("Thư viện JSZip chưa được tải. Vui lòng tải lại trang.");
  }
  const zip = new window.JSZip();
  const scormHtml = injectScormIntoHtml(htmlContent);
  const manifest = generateScormManifest(gameTitle);

  zip.file("index.html", scormHtml);
  zip.file("imsmanifest.xml", manifest);

  return await zip.generateAsync({
    type: "blob",
    mimeType: "application/zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
