const fs = require('fs');

const files = [
  'dist/assets/AIToolsPage-4aWZjw7J.js',
  'dist/games_2/assets/AIToolsPage-4aWZjw7J.js',
  'public/assets/AIToolsPage-4aWZjw7J.js',
  'public/games_2/assets/AIToolsPage-4aWZjw7J.js'
];

const newTool = '{id:"tool-pdf-to-docx",isFree:!0,group:"product",title:"PDF Sang Word (Giữ công thức và hình vẽ)",description:"Chuyển đề PDF sang Word (.docx): công thức dạng Equation hoặc LaTeX MathType, tự cắt hình vẽ. Tác giả: NMH thầy Nguyễn Mạnh Hùng.",icon:"📄",color:"linear-gradient(135deg, #4f46e5, #0d9488)",localUrl:"/ai-tools/pdf-to-docx/index.html"},';

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('tool-pdf-to-docx')) {
    console.log(file, 'already has tool-pdf-to-docx');
    continue;
  }
  const target = '{id:"tool-html-game"';
  if (code.includes(target)) {
    code = code.replace(target, newTool + target);
    fs.writeFileSync(file, code, 'utf8');
    console.log(file, 'updated successfully!');
  } else {
    console.log(file, 'target not found');
  }
}
