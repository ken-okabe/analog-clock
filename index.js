let analogclock,digitalclock,secondshand,minuteshand,hourshand, soundtoggle,context;
let tickURL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/358203/ticksingle.wav';
let audioinfo = {"url":tickURL,"buffer":null};
let now, h, m, s, timerid;
let ticking = false;

document.addEventListener('DOMContentLoaded', function (e) {
  try {init();} catch (error){
    console.log("Data didn't load", error);}
});
function init(){
  secondshand = gid("secondshand");
  minuteshand = gid("minuteshand");
  hourshand = gid("hourshand");
  analogclock = gid("analogclock");
  digitalclock = gid("digitalclock");
  soundtoggle = gid("soundtoggle");
  makeMinMarkers();
  makeClockNumbers();
  //timerid = requestAnimationFrame(update);
  timerid = setInterval(update,1000);
  soundtoggle.addEventListener("click",toggleTick,false);
}
function getAudio(audioObject,callback){
  context = new (window.AudioContext || window.webkitAudioContext)();
  let req = new XMLHttpRequest();
    req.audioObject = audioObject;
		req.open("GET",audioObject.url,true); 
		req.responseType = "arraybuffer"; 
		req.addEventListener("progress", updateAudioProgress, false);
		req.onload = function() { 
			//decode the loaded data 
			context.decodeAudioData(req.response, function(buffer) { 
				audioObject.buffer = buffer;
        if (callback){
          callback(audioObject);
        }
			}); 
		};
		req.send();
}
function updateAudioProgress (oEvent) {
	  if (oEvent.lengthComputable) {
		let pc = oEvent.loaded / oEvent.total;
    //console.log(event.target);
    //console.log("Percent loaded is " + pc + "%.");
		if (pc >= 1){
			//console.log("Track loaded.");
		}
	}
}
function tickLoadChecker(audioObject){
  console.log("tick audio loaded from " + audioObject.url);
}

function update(){
  now = new Date();
  let oldsecond = s;
  h = now.getHours();
  m = now.getMinutes();
  s = now.getSeconds();
  secondshand.style.transform = `rotate(${s * 6}deg)`;
  minuteshand.style.transform = `rotate(${m * 6}deg)`;
  hourshand.style.transform = `rotate(${(h * 30) + ((m/60) * 30)}deg)`;
  digitalclock.innerHTML = now.toLocaleTimeString();
  //timerid = requestAnimationFrame(update);
  if (ticking){
    if (oldsecond !== s){
      if (audioinfo.buffer){
        playTick(audioinfo.buffer);
      }
    }
  }
}
function toggleTick(){
  if (!audioinfo.buffer){
    getAudio(audioinfo,tickLoadChecker);
  }
  ticking = !ticking;
  if (ticking){
    playTick(audioinfo.buffer);
    soundtoggle.classList.remove("speaker--off");
    soundtoggle.classList.add("speaker--on");
  }else{
    soundtoggle.classList.remove("speaker--on");
    soundtoggle.classList.add("speaker--off");
  }
}

function playTick(audioBuffer) {
  if (context.state === "suspended") {
    context.resume();
  }
  let source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(context.destination);
  source.start();
}
function gid(idstring){
  //saves lots of typing for those who eschew Jquery
  return document.getElementById(idstring);
}
function makeMinMarkers(){
  let minmarkers = gid("minmarkers");
  let code = "";
  for (let i=0;i<30;i++){
    let classname = i % 5 === 0 ? "guide" : "guidedot";
    let angle = i * 6;
    code += `<div class="${classname}" style="--angle:${angle}deg;"></div>`;
  }
  minmarkers.innerHTML = code;
}
function makeClockNumbers(){
  let clocknumbers = gid("clocknumbers");
  let clocknumbers24 = gid("clocknumbers24");
  let nums = [3,4,5,6,7,8,9,10,11,12,1,2];
  let code = "";
  for (let i=0;i<12;i++){
    code += `<div class="clockdigits">${nums[i]}</div>`;
  }
  clocknumbers.innerHTML = code;
  code = ``;
  for (let i=0;i<12;i++){
    let mil = (nums[i] + 12).toString();
    code += `<div class="clockdigits24">${mil}</div>`;
  }
  clocknumbers24.innerHTML = code;
  let cns = document.querySelectorAll(".clockdigits");
  for (let i=0;i<12;i++){
    let p = getCirclePoint(50,(i * 30),50,50);
    cns[i].style.left = `calc(${p.x}% - 2em)`;
    cns[i].style.top = `calc(${p.y}% - 0.75em)`;
  }
  let cns24 = document.querySelectorAll(".clockdigits24");
  for (let i=0;i<12;i++){
    let p = getCirclePoint(50,(i * 30),50,50);
    cns24[i].style.left = `calc(${p.x}% - 2em)`;
    cns24[i].style.top = `calc(${p.y}% - 0.75em)`;
  }
}
function getCirclePoint(r,degrees,cx,cy){
  let angleInRadians = degrees * (Math.PI / 180);
  let x = cx + r * Math.cos(angleInRadians);
  let y = cy + r * Math.sin(angleInRadians);
  return {x,y};
}