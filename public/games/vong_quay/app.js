
const canvas=document.getElementById("wheelCanvas");
const ctx=canvas.getContext("2d");
const spinSound = document.getElementById("spinSound");
const winSound = document.getElementById("winSound");

let students=[];
let originalStudents=[];
let rotation=0;
let spinning=false;

const colors=[
"#58c7c1",
"#4cb0ca",
"#f39a72",
"#93c8bb",
"#e8d26c",
"#f8696b"
];

function loadList(){

// Tự động đồng bộ danh sách từ SmartEdu Play (nếu chưa có danh sách lưu)
try {
    const rawSaved = sessionStorage.getItem('smartedu_imath_questions');
    if (rawSaved && !localStorage.getItem("studentWheelList")) {
        const parsed = JSON.parse(rawSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
            const qNames = parsed.map((q, idx) => q.title || `Câu hỏi ${idx + 1}`);
            document.getElementById("namesInput").value = qNames.join("\n");
        }
    }
} catch(e) {}


const saved=localStorage.getItem("studentWheelList");

if(saved){
document.getElementById("namesInput").value=saved;
}

updateStudents();
}

function saveList(){

localStorage.setItem(
"studentWheelList",
document.getElementById("namesInput").value
);

alert("Đã lưu danh sách");
}

function updateStudents(){

students=document.getElementById("namesInput")
.value
.split("\n")
.map(x=>x.trim())
.filter(Boolean);

if(originalStudents.length===0){
originalStudents=[...students];
}

document.getElementById("remainCount").innerText=students.length;

draw();
}
function playSpinSound() {
    if (!spinSound) return;

    spinSound.pause();
    spinSound.currentTime = 0;

    spinSound.play().catch(() => {});
}

function stopSpinSound() {
    if (!spinSound) return;

    spinSound.pause();
    spinSound.currentTime = 0;
}

function playWinnerSound() {
    if (!winSound) return;

    winSound.pause();
    winSound.currentTime = 0;

    winSound.play().catch(() => {});
}
function restoreList(){

students=[...originalStudents];

document.getElementById("remainCount").innerText=students.length;

draw();
}

function drawArcText(text,cx,cy,radius,start,end){

const middle=(start+end)/2;

let fontSize=26;

if(students.length>12) fontSize=22;
if(students.length>20) fontSize=18;

ctx.font=`bold ${fontSize}px Segoe UI`;
ctx.fillStyle="white";

let totalWidth=0;

for(const ch of text){
totalWidth+=ctx.measureText(ch).width;
}

const totalAngle=totalWidth/radius;

let current=middle-totalAngle/2;

for(const ch of text){

const w=ctx.measureText(ch).width;
const a=w/radius;

current+=a/2;

ctx.save();

ctx.translate(cx,cy);
ctx.rotate(current);

ctx.translate(radius,0);

ctx.rotate(Math.PI/2);

if(middle>Math.PI/2 && middle<3*Math.PI/2){
ctx.rotate(Math.PI);
}

ctx.shadowColor="rgba(0,0,0,.3)";
ctx.shadowBlur=4;

ctx.textAlign="center";
ctx.textBaseline="middle";

ctx.fillText(ch,0,0);

ctx.restore();

current+=a/2;
}
}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

if(students.length===0) return;

const cx=450;
const cy=450;
const r=390;

ctx.save();
ctx.translate(cx,cy);
ctx.rotate(rotation*Math.PI/180);
ctx.translate(-cx,-cy);

const angle=2*Math.PI/students.length;

students.forEach((name,i)=>{

ctx.beginPath();
ctx.moveTo(cx,cy);
ctx.arc(cx,cy,r,i*angle,(i+1)*angle);
ctx.closePath();

ctx.fillStyle=colors[i%colors.length];
ctx.fill();

ctx.strokeStyle="white";
ctx.lineWidth=4;
ctx.stroke();

drawArcText(
name,
cx,
cy,
r*0.78,
i*angle,
(i+1)*angle
);
});

ctx.restore();
}

function confetti(){

for(let i=0;i<120;i++){

const div=document.createElement("div");

div.style.position="fixed";
div.style.left=Math.random()*100+"vw";
div.style.top="-20px";

div.style.width="10px";
div.style.height="10px";

div.style.background=
colors[Math.floor(Math.random()*colors.length)];

div.style.zIndex=9999;

document.body.appendChild(div);

const end=Math.random()*100;

div.animate(
[
{transform:"translateY(0)"},
{transform:`translateY(${window.innerHeight+100}px)`}
],
{
duration:2500+Math.random()*2000
}
);

setTimeout(()=>div.remove(),4500);
}
}

function spin(){

if(spinning || students.length===0) return;

spinning=true;

playSpinSound();

const winner=Math.floor(Math.random()*students.length);

const seg=360/students.length;

const target=360-(winner*seg+seg/2);

const finalRot=rotation+360*8+target;

const start=performance.now();
const duration=4000;
const begin=rotation;

function animate(t){

let p=Math.min((t-start)/duration,1);

let ease=1-Math.pow(1-p,3);

rotation=begin+(finalRot-begin)*ease;

draw();

if(p<1){
requestAnimationFrame(animate);
}else{

rotation=finalRot%360;

draw();

stopSpinSound();
playWinnerSound();

const name=students[winner];

students.splice(winner,1);

document.getElementById("remainCount").innerText=students.length;

document.getElementById("winnerName").innerText=name;

document.getElementById("winnerModal").style.display="flex";

confetti();

spinning=false;
}
}

requestAnimationFrame(animate);
}

function closeModal(){
document.getElementById("winnerModal").style.display="none";
draw();
}

function toggleFullscreen(){

if(!document.fullscreenElement){
document.documentElement.requestFullscreen();
}else{
document.exitFullscreen();
}
}

document
.getElementById("spinBtn")
.addEventListener("click",spin);

document
.getElementById("namesInput")
.addEventListener("input",updateStudents);

loadList();
