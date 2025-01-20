
function dead() {
	mod = "invert";
	document.getElementsByTagName('body')[0].style.background = "white";
}

let starSongWanted = [];
function starOf(song = undefined, difficulty = undefined) {
	starSongWanted = [song, difficulty]
	if (song != undefined && difficulty != undefined) return "☆" + (isNaN(starRating(loadChart(false, true, [songdata[song], difficulty]))) ? "?" : starRating(loadChart(false, true, [songdata[song], difficulty])).toFixed(2));
	else return "☆" + (isNaN(starRating(loadChart(false, true, [songdata[selected.song], selected.difficulty]))) ? "?" : starRating(loadChart(false, true, [songdata[selected.song], selected.difficulty])).toFixed(2));
}

function getEventTime(ev) {
	lastKeyPressTime = ev.timeStamp;
	if (ev.key.toLowerCase() == selected.settings.controls[1].toLowerCase() || ev.key.toLowerCase() == selected.settings.controls[2].toLowerCase())
	if (mode == 2) {
		hitting.push(1);
		if (selected.settings.hitsounds) {
			sfxaudios[4].currentTime = 0;
			sfxaudios[4].play();
		}
	}
	if (ev.key.toLowerCase() == selected.settings.controls[0].toLowerCase() || ev.key.toLowerCase() == selected.settings.controls[3].toLowerCase())
	if (mode == 2) {
		hitting.push(2);
		if (selected.settings.hitsounds) {
			sfxaudios[5].currentTime = 0;
			sfxaudios[5].play();
		}
	}
}

let lastKeyPressTime = 0;
document.body.addEventListener("keydown", getEventTime);
document.body.addEventListener("touchstart", (ev) => {
    let { touches, changedTouches } = ev.originalEvent ?? ev;
    let touch = touches[0] ?? changedTouches[0];
	document.body.dispatchEvent(
    new KeyboardEvent("keydown", {
		key: selected.settings.controls[Math.floor(touch.pageX/window.innerWidth * 4)],
		bubbles: true,
		cancelable: false
    }));
	Mousetrap.trigger(selected.settings.controls[Math.floor(touch.pageX/window.innerWidth * 4)], "keydown");
	ev.preventDefault();
});

//Menu
let timeStarted = 0;
let uracounter = 0
let mode = -1
let canSelect = true
/*
-1 = ready?
0 = title
1 = song select
2 = ingame
3 = results
*/
let selected = {
	song: 0,
	difficulty: -3,
	selection: "song",
	settings: {
		controls: ["d", "f", "j", "k"],
		volume: 25,
		offset: 0,
		customBuffer: false,
		hitsounds: false,
		GAS: false,
		defaultGauge: "None",
		vsync: true,
		maxFPS: 60,
		maxTPS: 240,
		names: [
			"Volume (%)", "Chart Offset (ms)", "Audio-Ran Notes", "Default Gauge", "VSync", "Max FPS", "Max TPS", "Upload Custom Chart"
		],
		amounts: [
			25, 0, false, "None", true, 60, 240, ""
		],
		range: [
			[0, 100], [-1500, 1500], ()=>{selected.settings.customBuffer = !selected.settings.customBuffer}, ()=>{selected.settings.defaultGauge = gaugeNames[(gaugeNames.indexOf(selected.settings.defaultGauge)+1) % 7]}, ()=>{selected.settings.vsync = !selected.settings.vsync}, [1, 360], [1, 2880], ()=>{customChartUpload()}
		],
		descriptions: [
			"Sets the volume of the game in percentage.\n0% is the minimum, playing no sound, and 100% is the maximum.",
			"Sets the offset of the note chart in milliseconds.",
			"Enables notes to be moved based off the audio time, rather than\ngame time. This may cause a bit of lag in exchange for\nguaranteed sync.",
			"You can force a type of clear gauge.\nEasier, Easy, and Normal perform similarly to standard Taiko.\nHard, EXHard, and GAS perform similarly to BMS.\n\nIf \"None\" is selected, the gauge will be based off\nthe chosen difficulty.",
			"Defaults the FPS to your monitor's refresh rate.",
			"Sets the maximum FPS (Rendering) of the game, IF Vsync is off.",
			"Sets the maximum TPS (Internal FPS) of the game.",
			"You can locally upload a custom chart that you want to play.\nSelect two files, one for audio and one for sound.\nOtherwise, it won't work. (Recommended <15 MB)\n\nDue to the syntax of these charts, there is a\npossibility that it won't work as intended."
		]
	},
	mods: {
		songSpeed: 0
	}
}

if (localStorage.settings != undefined && localStorage.settings != "[object Object]") {
	let parsedSettings = JSON.parse(localStorage.settings);
	selected.settings.controls = parsedSettings.controls;
	selected.settings.volume = parsedSettings.volume;
	selected.settings.offset = parsedSettings.offset;
	selected.settings.customBuffer = parsedSettings.customBuffer;
	selected.settings.hitsounds = parsedSettings.hitsounds;
	selected.settings.GAS = parsedSettings.GAS;
	selected.settings.defaultGauge = parsedSettings.defaultGauge;
	selected.settings.maxFPS = parsedSettings.maxFPS;
	selected.settings.maxTPS = parsedSettings.maxTPS;
	selected.settings.amounts = parsedSettings.amounts;
}
setInterval(() => {
	localStorage.settings = JSON.stringify(selected.settings);
}, 10000)

function modApply() {
	starry = [];
	for (let i = 0; i < songdata.length; i++) {
		songaudios[i].playbackRate = (2 ** (selected.mods.songSpeed / 12));
		songaudios[i].preservesPitch = false;
		starry.push([])
		for (let j = 0; j <= 3 + (songdata[i].includes("COURSE:4")); j++) {
			starry[i].push(starOf(i, j));
		}
	}
}

function scoreMultiplier() {
	let speedMult = selected.mods.songSpeed >= 0 ? (1 + (0.05 * selected.mods.songSpeed)) : (1 - (selected.mods.songSpeed / 12))
	return speedMult;
}

function modsToText() {
	if (selected.mods.songSpeed == 0) {
		return ""
	} else {
		return `   \`// FREQ+${selected.mods.songSpeed} [~${(2**(selected.mods.songSpeed/12)).toFixed(2)}x]\``
	}
}

function scoreIncrease() {
	let scoreGain = (20*(selected.difficulty+1)) + ~~(10 * currentSongData.level.replaceAll(/[^0-9]/g, "")) + (5 * Math.min(~~(hits[4]/10), 6))
	if (currentJudgement[0] == "可") scoreGain *= 0.5;
	if (currentJudgement[0] == "不可") scoreGain = ~~(-1 * currentSongData.level.replaceAll(/[^0-9]/g, ""));
	score += ~~(scoreGain * scoreMultiplier());
}

//Gameplay
//nothing here anymore


//Values of things
let difficulties = {
	names:  ["Easy",    "Normal",  "Hard",    "Extreme", "Extra"],
	colors: ["#FF0000", "#00FF00", "#0080FF", "#C000FF", "#0000FF"],
	gauges: ["Easier", "Easy", "Easy", "Normal", "Normal"],
	stars:  [5,         7,         8,         10,        10],
	hitwindow: [[0.042, 0.108, 0.125], [0.036, 0.097, 0.119], [0.030, 0.086, 0.113], [0.025, 0.075, 0.108], [0.025, 0.075, 0.108]]
};

let grades = {
	names: ["F",       "E-",      "E",       "E+",      "D-",      "D",       "D+",      "C-",      "C",       "C+",      "B-",      "B",       "B+",      "A-",      "A",       "A+",      "S-",      "S",       "S+",      "δ"],
   colors: ["#A00000", "#B30000", "#CC0000", "#E60000", "#FF0000", "#FF004D", "#FF00C3", "#CC00FF", "#2A00FF", "#004CFF", "#00AAFF", "#00FFFF", "#00FFD0", "#00FF5E", "#00FF0D", "#40FF00", "#80FF00", "#AAFF00", "#D4FF00", "#FFFF00", "#FFD500", "#FFAA00", "#FF8000", "#808080"],
   values: [0,         50,        52,        58,        60,        62,        68,        70,        72,        78,        80,        81.5,      88.5,      90,        91,        94,        95,        95.5,      99,        100,       100.2,     100.8,     101,       Infinity],
};

function gradeof(num = 100) {
	let a;
	for (let i = 0; i < grades.values.length; i++) {
		if (num >= grades.values[i] && num < grades.values[i+1]) {a = i; break;}
	}
	return {name: grades.names[a], color: grades.colors[a], values: grades.values[a]};
};


//Misc.
var res = [window.innerWidth, window.innerWidth / 2.010471204188482];
var cDate = new Date();
var timefunc = [{funct: () => {}, time: 0, executed: false}]; //function, time, executed already
var debug = false;
var debugval = [0, false];
let tipnum = Math.floor(Math.random() * tips.length);

Mousetrap.addKeycodes({
	144: 'numlock'
});

String.prototype.lengthWithJP = function () {
	return this.length + (this.replaceAll(/[!-~\s]/gm, "").length * 1.25)
};

let webhookLastSent = performance.now();
const performanceStart = performance.now();
let cansubmit = false;
let scoreQueue = [];
setTimeout(() => {
	setInterval(async () => {
		//console.log(performance.now());
		if ((Math.floor((performance.now() - performanceStart) / 250) * 250) % 5000 == 0 && scoreQueue[0]) {
			
			let clearType;
		
			if (hits[2] != 0) {
			if (clearGauge.mode != "Hard" && clearGauge.mode != "EXHard") {
					if (clearGauge.current() >= clearThresh()) {
						switch (clearGauge.mode) {
							case "Easier":
							clearType = `easy clear${clearGauge.current() == 100 ? "+" : ""}`
							break;
							case "Easy":
							clearType = `easy clear${clearGauge.current() == 100 ? "+" : ""}`
							break;
							case "Normal":
							clearType = `clear${clearGauge.current() == 100 ? "+" : ""}`
							break;
						}
					} else ts = ["fail", "#A000E0"]
				} else {
					if (clearGauge.current() > 0) {
						switch (clearGauge.mode) {
							case "Hard":
							clearType = `hard clear${clearGauge.current() == 100 ? "+" : ""}`
							break;
							case "EXHard":
							clearType = `exhard clear${clearGauge.current() == 100 ? "+" : ""}`
							break;
						}
					} else clearType = ["hard fail", "#FF4000"]
				}
			} else {
				if (hits[0] == 0) clearType = "okay play";
				else if (hits[1] == 0) clearType = "donderful combo";
				else clearType = "full combo";
			}
	
			let sp = await skillPoints((hits[0]*100 + hits[1]*50) / (hits[0]+hits[1]+hits[2]))
	
			let scoreMessage = `New score achieved on **${currentSongData.title}** (${difficulties.names[selected.difficulty + Math.floor(uracounter%20/10)]} ☆${currentSongData.level}${tableDiff != "" ? " / " + tableDiff : ""}) by *${currentSongData.subtitle.replace(/^--|^\+\+/g, "")}!*${modsToText()}
- they achieved **"${clearType}"** with ${clearGauge.current().toFixed(1)}% of the ${clearGauge.mode} gauge filled.
- they got a **${Math.round(((hits[0]*100 + hits[1]*50) / (hits[0]+hits[1]+hits[2])) * 100) / 100}% ${gradeof((hits[0]*100 + hits[1]*50) / (hits[0]+hits[1]+hits[2])).name}** rank.
*${hits[0]} goods / ${hits[1]} okays / ${hits[2]} misses
${hits[3]} rolls / ${hits[5]} max combo*

${sp == "unranked" ? "" : "*experimental: " + sp.toFixed(1) + "sp*"}`

			if (performance.now() - webhookLastSent >= 5000) {
				webhookLastSent = performance.now();
				await new Promise(r => betterTimeout(r, 5000));
				let xhr = new XMLHttpRequest();
				xhr.open("POST", "https://discord.com/api/webhooks/1152414830234451968/lt55EOeuLdO0z9wW8tF9bATqJ0UpokFjMczwl3f19U8jN5df5dNap92dGRZiM88mshJm", true);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify({
					'content': scoreMessage,
					'username': 'the score man',
					'avatar_url': 'https://cdn.discordapp.com/attachments/637852673143734272/1152418228782514256/image.png'
				}));
			} else {
				console.log(`Please wait ${Math.round(5000 - (performance.now() - webhookLastSent)) / 1000} more seconds before you are able to send another webhook post.`)
			}
			
			console.log(scoreMessage)
			
			scoreQueue.shift();
		}
	}, 5000)
}, 5000)

//let maxFPS = 60
//let maxTPS = 240

let tableDiff = ""


//Setting the canvas resolution
function canvasScaleRefresh() {
	res = [window.innerWidth, window.innerWidth / 2.010471204188482];
	ID("gameCanvas").width = res[0];
	ID("gameCanvas").height = res[1];
	cv.scale(res[0] / 1536, res[1] / 764);
}
canvasScaleRefresh();

addEventListener("resize", (event) => {
	canvasScaleRefresh();
});


console.log(`Hey, are you testing?\nDon't cheat!\n\nねぇ、 テストしていますか?\nずるしないでください。`);


//song stuff

let pfoffset = 0;
let songtime = 0
let songNotes = 0
//let clearGauge = [0, "Normal"]
let clearGauge = {
	easier: 0,
	easy: 0,
	normal: 0,
	hard: 100,
	exhard: 100,
	mode: "Normal",
	current: function () {return eval(`clearGauge.${clearGauge.mode.toLowerCase()}`)}
}
let gaugeNames = ["None", "Easier", "Easy", "Normal", "Hard", "EXHard", "GAS"]
let clearShow = false
let clearThresh = () => {return (clearGauge.mode == "Normal" ? 80 : (clearGauge.mode == "Easy" ? 72 : (clearGauge.mode == "Easier" ? 64 : 100)))}
let noteQueue = []
let rollQueue = []
let barQueue  = []
let renderQueue = []

function rrq(n = Infinity) {
	if (n == Infinity) {
		renderQueue = [...noteQueue].sort(function(a, b){return a.scroll*a.bpm - b.scroll*b.bpm})
	} else {
		renderQueue = []
		for (let i = 0; i < n && noteQueue[i] != undefined; i++) {
			renderQueue.push(noteQueue[i])
			renderQueue = [...renderQueue].sort(function(a, b){return a.scroll*a.bpm + b.scroll*b.bpm})
		}
	}
}

let currentSongData = {
	title: "",
	subtitle: "",
	wave: "",
	level: "1",
	nps: 0,
}

let ingameBPM = 120

let score = 0;
let balloon = {at: 0, hits: 0, next: 1, hitQueue: []}
let eventQueue = []
let currentJudgement = ["", ""]
let hits = [0, 0, 0, 0, 0, 0] //good, ok, bad, rolls, combo, maxcombo
let hitting = []
let gogo = false
let songaudios = []
let sfxaudios = ["menu1", "menu2", "fail", "submit", "hit/don1", "hit/ka1"]
let songbpms = []
let mshits = []

let starry = [];

function sload() {
  for (let i = 0; i < songdata.length; i++) {
	  songaudios.push(new Audio(mdValue("WAVE", songdata[i]) + "?v=0122"));
  }
  for (let i = 0; i < sfxaudios.length; i++) {
	  sfxaudios[i] = new Audio(`sfx/${sfxaudios[i]}.wav?v=0122`);
  }
  
  // thanks gpt lol
  setTimeout(() => {
        for (let i = 0; i < songaudios.length; i++) {
            let audio = songaudios[i];
            if (audio.readyState < 2) {
                console.warn(`song ${audio.src} was not loaded, loading the mp3 version instead`);
                let mp3Src = audio.src.replace(/\.ogg/, '.mp3');
                audio.src = mp3Src;
                audio.load();
				
                audio.addEventListener('canplaythrough', () => {
                    console.log(`fallback audio ${mp3Src} loaded successfully`);
                });

                audio.addEventListener('error', () => {
                    console.error(`failed to load fallback audio ${mp3Src}`);
                });
            }
        }
    }, 5000); // 5-second timeout
}

//other stuff
var bgDensity = 50
let bgElements = []
//color, time, x

var fps = [60, 60]
var fpsarr = [[], []]
for (let i = 0; i < 200; i++) {fpsarr[0].push(60); fpsarr[1].push(60);}


let initsomething = async () => {
		await new Promise(r => betterTimeout(r, 5500))
		songaudios[selected.song].currentTime = (7000 - Math.min(parseFloat(mdValue("OFFSET", songdata[selected.song]))*1000 + 5500, 5500))/1000
}

let fadetomode = async (m) => {
	canSelect = false
	let j = 0;
	for (j = 0; j < 255; j+=6) {
		await new Promise(r => betterTimeout(r, 8));
		ID("blackTop").style.backgroundColor = `#000000${j.toString(16)}`;
		for(let i = 0; i < songaudios.length; i++) {songaudios[i].pause(); songaudios[i].volume = Math.max(((selected.settings.volume+1) - (1.1**j))/100, 0)}
		for(let i = 0; i < sfxaudios.length; i++) {sfxaudios[i].volume = Math.max(((selected.settings.volume+1) - (1.1**j))/100, 0)}
	}
	await new Promise(r => betterTimeout(r, 250))
	mode = m;
	canSelect = true
	
	if (mode == 0) {
		selected.song = Math.floor(Math.random() * songdata.length)
		songaudios[selected.song].currentTime = 0;
		songaudios[selected.song].play();
	}
	
	if (mode == 1) {
		balloon.at = 0; balloon.next = 1; balloon.hits = 0; balloon.hitQueue = []; selected.selection = "song"; selected.difficulty = -3; clearGauge.easier = 0; clearGauge.easy = 0; clearGauge.normal = 0; clearGauge.hard = 100; clearGauge.exhard = 100; combo = 0; hits = [0, 0, 0, 0, 0, 0]; currentJudgement = ["", ""]; clearShow = false; mshits = []; gogo = false; score = 0;
		
		//if (uracounter % 20 >= 10) {
			//let a = [difficulties.names[3], difficulties.colors[3]];	
  //[difficulties.names[3], difficulties.names[4]] = [difficulties.names[4], difficulties.names[3]];
  //[difficulties.colors[3], difficulties.colors[4]] = [difficulties.colors[4], difficulties.colors[3]];
		//}
				
		uracounter = 0;
		songaudios[selected.song].play();
		songaudios[selected.song].currentTime = isNaN(parseFloat(mdValue("DEMOSTART", songdata[selected.song]))) ? 0 : parseFloat(mdValue("DEMOSTART", songdata[selected.song]));
	}
	
	if (mode == 2) {
		for(let i = 0; i < songaudios.length; i++) {songaudios[i].pause()}
		for(let i = 0; i < sfxaudios.length; i++) {sfxaudios[i].pause()}
		timeStarted = performance.now();
		loadChart();
		currentSongData.title = mdValue("TITLE", songdata[selected.song])
		currentSongData.subtitle = mdValue("SUBTITLE", songdata[selected.song])
		let a = (selected.difficulty == 3 && hasCourse("4", songdata[selected.song]) && uracounter % 20 >= 10) ? 1 : 0
		let levelc = parseInt(mdValue("LEVEL", extractCourse(selected.difficulty+a, songdata[selected.song])));
		let hasplus = (!isNaN(parseInt(mdValue(`DIFPLUS${selected.difficulty+a}`, extractCourse(selected.difficulty+a, songdata[selected.song])))) || (mdValue("LEVEL", extractCourse(selected.difficulty+a, songdata[selected.song])) - levelc) >= 0.75)
		let hasminus = ((mdValue("LEVEL", extractCourse(selected.difficulty+a, songdata[selected.song])) - levelc) <= 0.25 && (mdValue("LEVEL", extractCourse(selected.difficulty+a, songdata[selected.song])) - levelc) != 0);
		currentSongData.level = `${parseInt(mdValue("LEVEL", extractCourse(selected.difficulty+a, songdata[selected.song])))}${hasplus ? "+" : (hasminus ? "-" : "")}`
		tableDiff = ""
		for (let i = 0; i < tabledata.length; i++) {
			for (let j = 0; j < tabledata[i].songs.length; j++) {
				if (currentSongData.title == tabledata[i].songs[j][0] && selected.difficulty + Math.floor(uracounter / 10) == tabledata[i].songs[j][2]) {
					tableDiff = `${tabledata[i].name} ${tabledata[i].songs[j][1]}`;
					break;
				}
			}
		}
	}
	
	if (mode == 3) {
		cansubmit = true;
	}
	
	for (j = 255; j > 0; j-=4) {
		await new Promise(r => betterTimeout(r, 8));
		ID("blackTop").style.backgroundColor = `#000000${j.toString(16)}`;
		if (mode < 2) {
			for(let i = 0; i < songaudios.length; i++) {songaudios[i].volume = selected.settings.volume / 100}
			for(let i = 0; i < sfxaudios.length; i++) {sfxaudios[i].volume = selected.settings.volume / 100}
		}
	}
	
}

let lastTime = [0, 0];



let playfieldX = 200;


let previousRender = performance.now();
//draw on the canvas for the game
function update() {
window.requestAnimationFrame(update);

if (performance.now() - previousRender > 1000/selected.settings.maxFPS || selected.settings.vsync) {
	previousRender = performance.now() - ((performance.now() - previousRender) % 1000/selected.settings.maxFPS);
cv.clear();

try {

for (let i = 0; i < bgElements.length; i++) {
	cv.circ(bgElements[i].color + "60", bgElements[i].x, 764 * (((performance.now() - bgElements[i].time) + (i*-1)*(20000/bgDensity))/12000), 30, false, [60, bgElements[i].color])
}
	cv.rect(`#${clearGauge.current() >= clearThresh() ? "FFFF00" : "000000"}${(clearGauge.mode.includes("Hard") && clearGauge.current() == 0) ? "60" : "1A"}`, 0, 0, 1536, 764)

switch (mode) {

case -1:
break;


//title
case 0:
cv.text("taiko bruh master", ["#FF0000", "#00FFFF"], 768, 275, "pixel", "90", "center");
cv.text(`press ${selected.settings.controls[1].toUpperCase()} / ${selected.settings.controls[2].toUpperCase()} to start!`, `#FFFFFF${numtobase(Math.floor(Math.abs(Math.sin((performance.now()-500) / 450)*100)) + 5, 16).padStart(2, "0")}`, 768, 400, "pixel", "65", "center");
cv.text(`(controls are ${(selected.settings.controls[0] + selected.settings.controls[1] + selected.settings.controls[2] + selected.settings.controls[3]).toUpperCase()}.)`, `#FFFFFFA0`, 768, 600, "pixel", "40", "center");

cv.text(tips[tipnum], ["#FF8080", "#80FFFF"], 768, 715, "pixel2", "35", "center")

cv.text("α.1.2:4\nhttps://discord.gg/2D2XbD77HD", "#DDDDDD50", 0, 30, "monospace", "25", "left");
break;



//song select
case 1:
	let dataOfSelected = selected.song != -1 ? songdata[selected.song] : ""
	
	cv.rect("#FFCC99", 30, (100 * (-1-selected.song)) + 320, 500, 80);
	if (selected.song != -1) cv.rect("#000000", 35, (100 * (-1-selected.song)) + 325, 490, 70);
	cv.text("Settings", (selected.song != -1 ? "#FFCC99" : "#000000"), 280, (100 * (-1-selected.song)) + 365, "pixel", "30", "center");

	for (let i = 0; i < songdata.length; i++) {
		levelF = parseFloat(mdValue("LEVEL", extractCourse(3, songdata[i])))
		levelS = parseFloat(mdValue("LEVEL", songdata[i]))
		cv.rect("#00C0FF", 30, (100 * (i-selected.song)) + 320, 500, 80);
		if (selected.song != i) cv.rect("#000000", 35, (100 * (i-selected.song)) + 325, 490, 70);
		cv.text(mdValue("TITLE", songdata[i]), (selected.song != i ? "#00C0FF" : "#000000"), 280, (100 * (i-selected.song)) + 365, "pixel", (mdValue("TITLE", songdata[i]).lengthWithJP() > 33 ? (29 * (33 / mdValue("TITLE", songdata[i]).lengthWithJP())).toString() : "30"), "center");
		cv.text(Math.floor(levelF) + `${(!isNaN(parseInt(mdValue("DIFPLUS3", songdata[i]))) || (levelF - Math.floor(levelF)) >= 0.75) ? "+" : (((levelF - Math.floor(levelF)) <= 0.25 && (levelF - Math.floor(levelF)) != 0) ? "-" : "")}`
		, (selected.song != i ? (songdata[i].includes("COURSE:4") ? difficulties.colors[4] : difficulties.colors[mdValue("COURSE", songdata[i])]) : "#000000"), 42, (100 * (i-selected.song)) + 388, "pixel2", "20", "left", false, [Math.max((levelS - 10)*7, 0), (selected.song != i ? "#00C0FF" : "#000000")]);
	}

	cv.rect("#00FFFF", 650, 20, 850, 724);
	cv.rect("#000000", 655, 25, 840, 714);
	if(selected.song != -1) {
		cv.text("Length: " + lengthOfTime(songaudios[selected.song].duration*1000/(2 ** (selected.mods.songSpeed / 12))), selected.mods.songSpeed != 0 ? "#E0E0C0" : "#00C0C0", 665, 65, "pixel", "30", "left");
		cv.text(mdValue("MAKER", dataOfSelected) != "" ? `Charted by ${mdValue("MAKER", dataOfSelected)}` : `It's unknown who charted this.`, "#00B0B0", 1075, 350, "pixel", "30", "center");

		if (songbpms[selected.song].length > 1) cv.text(`${selected.mods.songSpeed != 0 ? "~" : ""}${Math.round(songbpms[selected.song][0] * (2 ** (selected.mods.songSpeed / 12)) * 1000) / 1000}-${Math.round(songbpms[selected.song][songbpms[selected.song].length-1] * (2 ** (selected.mods.songSpeed / 12)) * 1000) / 1000} (${Math.round(mdValue("BPM:", dataOfSelected) * (2 ** (selected.mods.songSpeed / 12)) * 1000) / 1000}) BPM`, selected.mods.songSpeed != 0 ? "#D0D0C0" : "#00C0C0", 1485, 65, "pixel", "30", "right");
		else cv.text(`${selected.mods.songSpeed != 0 ? "~" : ""}${Math.round(mdValue("BPM:", dataOfSelected) * (2 ** (selected.mods.songSpeed / 12)) * 1000) / 1000} BPM`, selected.mods.songSpeed != 0 ? "#D0D0C0" : "#00C0C0", 1485, 65, "pixel", "30", "right");

		cv.text(mdValue("TITLE", dataOfSelected), "#00FFFF", 1075, 150, "pixel", (mdValue("TITLE", dataOfSelected).lengthWithJP() > 24 ? (69 * (24 / mdValue("TITLE", dataOfSelected).lengthWithJP())).toString() : "70"), "center");
		cv.text(mdValue("SUBTITLE", dataOfSelected).replace(/^--|^\+\+/g, ""), "#00FFFF", 1075, 225, "pixel", "35", "center");
		
		cv.text(`experimental: ${starry[selected.song][Math.max(selected.difficulty + (selected.difficulty == 3 ? Math.floor((uracounter % 20) / 10) : 0), 0)]}`, "#00A0A0", 1480, 666, "pixel", "20", "right");
	}

	cv.rect("#FFA000", 720, 580, 100, 100);
	if (selected.difficulty != -1) cv.rect("#000000", 725, 585, 90, 90);
	cv.text("Back", (selected.difficulty != -1 ? "#FFA000" : "#000000"), 770, 635, "pixel", "20", "center")
	//cv.rect("#FFA0FF", 720, 580, 100, 100);
	/*if (selected.difficulty != -2) cv.rect("#000000", 725, 585, 90, 90);
	cv.text("Mods", (selected.difficulty != -2 ? "#FFA0FF" : "#000000"), 770, 635, "pixel", "20", "center")*/
	

	if (selected.song != -1) {
		for (let i = 0; i < 4; i++) {
			if(i == 3 && hasCourse("4", dataOfSelected) && uracounter % 20 >= 10) i++;
			let extractCI = extractCourse(i, dataOfSelected)
			let levelc = parseInt(mdValue("LEVEL", extractCI));
			let levelf = parseFloat(mdValue("LEVEL", extractCI));
			if (isNaN(levelc)) continue;
			let hasplus = (!isNaN(parseInt(mdValue("DIFPLUS", extractCI))) || (levelf - levelc) >= 0.75)
			let hasminus = (levelf - levelc <= 0.25 && levelf - levelc != 0);
			//if(i==4)i=3;
			cv.rect(difficulties.colors[i], 720 + 180 * Math.min(i, 3), 400, 165, 165);
			if (selected.difficulty != Math.min(i, 3)) cv.rect("#000000", 725 + 180 * Math.min(i, 3), 405, 155, 155);
			cv.rect((selected.difficulty != Math.min(i, 3) ? (levelc > difficulties.stars[i] ? [difficulties.colors[i] + "50", difficulties.colors[i] + "A0"] : difficulties.colors[i] + "50") : (levelc > difficulties.stars[i] ? [difficulties.colors[i], `#FFFFFF${numtobase(Math.floor(Math.abs(Math.cos((performance.now()-500) / 800)*50)) + 100, 16).padStart(2, "0")}`, difficulties.colors[i]] : "#0000001A")), 720 + 180 * Math.min(i, 3), 565 - (165 * (levelc / difficulties.stars[i])), 165, (165 * (levelc / difficulties.stars[i])));
			cv.text(difficulties.names[i], (selected.difficulty != Math.min(i, 3) ? difficulties.colors[i] : "#000000"), 805 + 180*Math.min(i, 3), 450, "pixel", "40", "center", false, [Math.max((levelc - difficulties.stars[i])*7, 0), (selected.difficulty != i ? difficulties.colors[i] : "#000000")])
			cv.text(levelc, (selected.difficulty != Math.min(i, 3) ? difficulties.colors[i] : "#000000"), 805 + 180*Math.min(i, 3), 520, "pixel2", "60", "center", false, [Math.max((levelc - difficulties.stars[i])*7, 0), (selected.difficulty != i ? difficulties.colors[i] : "#000000")])
			if (hasplus) cv.text("+", (selected.difficulty != Math.min(i, 3) ? shadeColor(difficulties.colors[i], 50) : "#000000"), 835 + 180*Math.min(i, 3), 500, "pixel2", (i > 1 ? "33" : "22"), "center", false, [Math.max((levelc - difficulties.stars[i])*7, 0), (selected.difficulty != Math.min(i, 3) ? difficulties.colors[i] : "#000000")])
			else if (hasminus) cv.text("-", (selected.difficulty != Math.min(i, 3) ? shadeColor(difficulties.colors[i], 50) : "#000000"), 835 + 180*Math.min(i, 3), 500, "pixel", (i > 1 ? "33" : "22"), "center", false, [Math.max((levelc - difficulties.stars[i])*7, 0), (selected.difficulty != Math.min(i, 3) ? difficulties.colors[i] : "#000000")])
		}
	} else {
		for (let i = 0; i < selected.settings.names.length; i++) {
			let affectedI = i - Math.max(selected.difficulty, 0)
			if (affectedI >= -1 && affectedI < 6) {
			cv.rect("#FFCC99", 1200, 70 + 75 * affectedI, 120, 50);
			cv.text(selected.settings.names[i], "#FFCC99", 720, 103 + 75 * affectedI, "pixel", "30", "left")
			cv.text(selected.settings.amounts[i].toString().charAt(0).toUpperCase() + selected.settings.amounts[i].toString().slice(1), "#FFCC99", 1170, 103 + 75 * affectedI, "pixel", "30", "right")
			if (selected.difficulty != i) cv.rect("#000000", 1205, 75 + 75 * affectedI, 110, 40);
			cv.text(i == 7 ? "Upload" : "Change", selected.difficulty != i ? "#FFCC99" : "#000000", 1260, 103 + 75 * affectedI, "pixel", "30", "center")
			}
		}
		cv.rect("#00000080", 655, 0, 840, 50);
		cv.rect("#000000", 655, 0, 840, 25);
		cv.rect("#000000", 655, 470, 840, 25);
		cv.rect("#00000080", 655, 445, 840, 50);
		cv.text(selected.settings.descriptions[selected.difficulty] != undefined ? selected.settings.descriptions[selected.difficulty] : "", "#FFCC99", 1475, 520, "pixel", "25", "right")
	}

	cv.rect("#00000080", 0, 680, 1536, 1500)
	cv.text(tips[tipnum], ["#FF8080", "#80FFFF"], 768, 715, "pixel2", "35", "center")
break;


	//game
	case 2:

	cv.rect("#00000080", 0, 170, 2000, 170)
	cv.rect(gogo ? "#FFCCCC" : "#FFFFFF", playfieldX, 180, 2000, 150)
	cv.rect(gogo ? "#661133" : "#111111", playfieldX+5, 185, 2000, 140)
	cv.circ("#FFFFFFA0", playfieldX+90, 253, 50, 3)
	cv.circ("#FFFFFFD0", playfieldX+90, 253, 30, 5)
	
	cv.rect(clearGauge.mode == "EXHard" ? "#804000" : "#800000", 1536-(1400 - playfieldX), 158, clearThresh()*10, 22)
	if(clearGauge.mode != "Hard" && clearGauge.mode != "EXHard") cv.rect("#808000", 1536-(400 + ((80 - clearThresh())*10))+(playfieldX - 200), 147, (100-clearThresh())*10, 33)
	
	cv.rect(clearGauge.current() < 100 || clearGauge.mode.includes("Hard") ? (clearGauge.mode == "EXHard" ? "#FF8000" : "#FF0000") : hslToHex(Math.floor(performance.now()/11)%360, 100, 50), 1536-(1400 - playfieldX), 158, Math.min(Math.floor(clearGauge.current()), clearThresh())*10, 22)
	if(!clearGauge.mode.includes("Hard")) cv.rect(clearGauge.current() < 100 ? "#FFFF00" : hslToHex(Math.floor(performance.now()/11)%360, 100, 50), 1536-(400 + ((80 - clearThresh())*10))+(playfieldX - 200), 147, (Math.floor(clearGauge.current()) > clearThresh() ? Math.min(Math.floor(clearGauge.current() - clearThresh()), (100-clearThresh())) : 0)*10, 33)


	//colors
	//Default
	let colorn = ["", "#FF0000", "#00D0FF", "#FF1010", "#10E0FF", "#FFA000", "#FFA000", "#FF3010", "#00FF00"]
	
	//Taikojiro
	//let colorn = ["", "#F04F1F", "#7FCFCF", "#F04F1F", "#7FCFCF", "#FFAF00", "#FFAF00", "#F04F1F", "#00FF00"]
	
	//Monochroma
	//let colorn = ["", "#000000", "#FFFFFF", "#000000", "#FFFFFF", "#808080", "#808080", "#A06060", "#00FF00"]
	
	//idk
	//let colorn = ["", "#FFA000", "#A060FF", "#FFB010", "#B070FF", "#FFFF00", "#FFFF00", "#FF3010", "#00FF00"];
	
	if (mod == "invert") {
		for (let cn = 1; cn < colorn.length; cn++) {
			//console.log(colorn[cn])
			let inverting = parseInt(colorn[cn].substr(1), 16);
			colorn[cn] = "#" + ((inverting & 0x000000) | (~inverting & 0xFFFFFF)).toString(16).padStart(6, "0");
			//console.log(colorn[cn])
		}
	}
	
	let isbig = (t) => {return t == 3 || t == 4 || t == 6}
	
	rrq(100);

	for (i in barQueue) {
		if ((playfieldX + 88) + ((barQueue[i].time - barQueue[i].position()) * barQueue[i].bpm*barQueue[i].scroll*3.7) > playfieldX + 5) cv.rect("#FFFFFF60", (playfieldX + 88) + ((barQueue[i].time - barQueue[i].position()) * barQueue[i].bpm*barQueue[i].scroll*3.7), 185, 4, 140)
	}
	
	for (i in rollQueue) {
		//console.log(rollQueue)
		i = parseInt(i) //why do i need to do this??
		if (i % 2 == 0 && rollQueue[i+1] != undefined) {
		cv.rect(colorn[rollQueue[i].type], (playfieldX + 90) + ((rollQueue[i].time - rollQueue[i].position()) * rollQueue[i].bpm*rollQueue[i].scroll*3.7), 253 - ((30 + (20*isbig(rollQueue[i].type)))), ((rollQueue[i+1].time - rollQueue[i].time) * rollQueue[i].bpm*rollQueue[i].scroll*3.7), (30 + (20*isbig(rollQueue[i].type))) * 2)
		cv.circ(colorn[rollQueue[i].type], (playfieldX + 90) + ((rollQueue[i].time - rollQueue[i].position()) * rollQueue[i].bpm*rollQueue[i].scroll*3.7), 253, 30 + (20*isbig(rollQueue[i].type)));
		cv.circ(colorn[rollQueue[i].type], (playfieldX + 90) + ((rollQueue[i+1].time - rollQueue[i+1].position()) * rollQueue[i].bpm*rollQueue[i].scroll*3.7), 253, 30 + (20*isbig(rollQueue[i].type)))
		}
	}
	
	for (let i = renderQueue.length - 1; i >= 0; i--) {
		if (!renderQueue[i].hit) {
		cv.circ(colorn[renderQueue[i].type], (playfieldX + 90) + ((renderQueue[i].time - renderQueue[i].position()) * renderQueue[i].bpm*renderQueue[i].scroll*3.7), 253, 30 + (20*isbig(renderQueue[i].type)))
		cv.circ("#FFFFFFDD", (playfieldX + 90) + ((renderQueue[i].time - renderQueue[i].position()) * renderQueue[i].bpm*renderQueue[i].scroll*3.7), 253, 30 + (20*isbig(renderQueue[i].type)), 4 + (2*isbig(renderQueue[i].type)))
		
		//HB
		//cv.circ(colorn[renderQueue[i].type], 290 + ((renderQueue[i].time - renderQueue[i].position()) * ingameBPM*renderQueue[i].scroll*3.7), 253, 30 + (20*isbig(renderQueue[i].type)))
		//cv.circ("#FFFFFFDD", 290 + ((renderQueue[i].time - renderQueue[i].position()) * ingameBPM*renderQueue[i].scroll*3.7), 253, 30 + (20*isbig(renderQueue[i].type)), 4 + (2*isbig(renderQueue[i].type)))
		}
	}
	
	cv.text((balloon.at != 0 && balloon.hits != 0) ? balloon.hits : "", "#FFFFFF", (playfieldX + 90), 150, "pixel", "45", "center")
	cv.text(currentJudgement[0], currentJudgement[1], (playfieldX + 90), 220, "pixel", "40", "center")
	cv.text(currentSongData.title, "#FFFFFF", 1536, 50, "pixel", "50", "right")
	
	cv.text(`${difficulties.names[selected.difficulty + Math.floor(uracounter%20/10)]} ☆${currentSongData.level}${tableDiff != "" ? " / " + tableDiff : ""}`, difficulties.colors[selected.difficulty + Math.floor(uracounter%20/10)], 1536, 100, "pixel", "35", "right")
	
	if (selected.mods.songSpeed != 0) {
		cv.text(`FREQ${selected.mods.songSpeed >= 0 ? "+" : "-"}${selected.mods.songSpeed}`, "#FFFFFFA0", 1536, 135, "pixel", "25", "right");
		cv.text(`~${(2 ** (selected.mods.songSpeed / 12)).toFixed(2)}xBPM`, "#FFFFFF60", 1536, 160, "pixel", "15", "right");
	}
	cv.text("good", "#FFA000", 240, 420, "pixel", "35", "left")
	cv.text("okay", "#80FFFF", 240, 455, "pixel", "35", "left")
	cv.text("miss", "#9000D0", 240, 490, "pixel", "35", "left")
	cv.text("rolls", "#FFD040", 240, 525, "pixel", "35", "left")
	cv.text("combo", "#FF6000", 240, 560, "pixel", "35", "left")
	//cv.text(`${((mshits.reduce((sum, a) => sum + a, 0))/mshits.length).toFixed(2)}ms avg`, "#FFFFFF80", 700, 525, "pixel", "20", "center")
	//cv.text(`${JSON.stringify(clearGauge, false, "\n")}`, "#FFFFFF80", 700, 525, "pixel", "20", "left")
	//cv.text(`BPM ${ingameBPM}`, "#FFFFFF80", 700, 525, "pixel", "20", "left")
	//cv.text(`☆${starRating(noteQueue).toFixed(2)}`, "#FFFFFF80", 700, 125, "pixel", "20", "center")
	//cv.text(`${JSON.stringify(hitting)}`, "#FFFFFF80", 700, 125, "pixel", "20", "center")
	cv.text((hits[4] > 0 ? hits[4] : ""), (hits[1] == 0 && hits[2] == 0 ? "#FFB080A0" : (hits[2] == 0 ? "#FFFFA0A0" : "#FFFFFFA0")), playfieldX - 20, 253, "pixel2", "45", "right")
	cv.text(`${hits[0]}\n${hits[1]}\n${hits[2]}\n${hits[3]}\n${hits[5]}`, "#FFFFFF", 400, 420, "pixel", "35", "right")
	cv.text(`${Math.round(((hits[0]*100 + hits[1]*50) / (hits[0]+hits[1]+hits[2])) * 100) / 100}%`, "#FFFFFF", 240, 600, "pixel", "35", "left")
	cv.text(score, "#FFFFFF", 240, 380, "pixel", "40", "left")
	if(!isNaN((hits[0]*100 + hits[1]*50) / (hits[0]+hits[1]+hits[2]))) cv.text(`${gradeof((hits[0]*100 + hits[1]*50) / (hits[0]+hits[1]+hits[2])).name}`, gradeof((hits[0]*100 + hits[1]*50) / (hits[0]+hits[1]+hits[2])).color, 400, 600, "pixel", "35", "right")
	
	if (clearShow) {
		let ts = ["clear", "#FFFFFF"]
		
		if (hits[2] != 0) {
		if (clearGauge.mode != "Hard" && clearGauge.mode != "EXHard") {
			if (clearGauge.current() >= clearThresh()) {
				switch (clearGauge.mode) {
					case "Easier":
					ts = [`easy clear${clearGauge.current() == 100 ? "+" : ""}`, `#${clearGauge.current() == 100 ? "CCFFCC" : "FFFFFF"}`]
					break;
					case "Easy":
					ts = [`easy clear${clearGauge.current() == 100 ? "+" : ""}`, `#${clearGauge.current() == 100 ? "CCFFCC" : "FFFFFF"}`]
					break;
					case "Normal":
					ts = [`clear${clearGauge.current() == 100 ? "+" : ""}`, `#${clearGauge.current() == 100 ? "CCFFCC" : "FFFFFF"}`]
					break;
				}
			} else ts = ["fail", "#A000E0"]
		} else {
			if (clearGauge.current() > 0) {
				switch (clearGauge.mode) {
					case "Hard":
					ts = [`hard clear${clearGauge.current() == 100 ? "+" : ""}`, `#${clearGauge.current() == 100 ? "FF8080" : "FF0000"}`]
					break;
					case "EXHard":
					ts = [`exhard clear${clearGauge.current() == 100 ? "+" : ""}`, `#${clearGauge.current() == 100 ? "FFB080" : "FF8000"}`]
					break;
				}
			} else ts = ["hard fail", "#FF4000"]
		}

	} else {
		if (hits[0] == 0) ts = ["wow you sure did \"okay\" alright", ["#00FFFF", "#FFFFFF"]]
		else if (hits[1] == 0) ts = ["DONDERFUL COMBO!!", ["#FF8080", "#FFC080", "#FFFF80", "#80FF80", "#80CFFF", "#8080FF", "#E080FF", "#FFFFFF", "#FFFFFF"]]
		else ts = ["FULL COMBO!", ["#FFFF00", "#FFFFA0"]]
	}
	cv.text(ts[0], ts[1], playfieldX+725, 265, "pixel", "60", "center")
	cv.text(clearGauge.mode.toUpperCase(), clearGauge.mode == "EXHard" ? "#FFB080" : (clearGauge.mode == "Hard" ? "#FF8080" : "#CCFFCC"), playfieldX+725, 305, "pixel2", "30", "center")
	}
	break;
	
	
	//result screen
	case 3:
	let accuracy = (hits[0]*100 + hits[1]*50) / (hits[0]+hits[1]+hits[2])
	
	cv.rect("#000000B0", 0, 0, 1536, 764)
	
	cv.text(currentSongData.title, "#FFFFFF", 768, 60, "pixel", "60", "center")

	cv.text(`${difficulties.names[selected.difficulty + Math.floor(uracounter%20/10)]} ☆${currentSongData.level}${tableDiff != "" ? " / " + tableDiff : ""}`, difficulties.colors[selected.difficulty + Math.floor(uracounter%20/10)], 768, 120, "pixel", "40", "center")
	if (selected.mods.songSpeed != 0) {
		cv.text(`FREQ${selected.mods.songSpeed >= 0 ? "+" : "-"}${selected.mods.songSpeed}`, "#FFFFFFA0", 760, 160, "pixel", "25", "center");
		cv.text(`~${(2 ** (selected.mods.songSpeed / 12)).toFixed(2)}xBPM`, "#FFFFFF60", 760, 185, "pixel", "15", "center");
	}
	
	cv.text(score, "#FFFFFF", 768, 415, "pixel", "60", "center")
	cv.text(`${Math.round((accuracy) * 100) / 100}%`, "#FFFFFF", 500, 215, "pixel", "60", "right")
	cv.text("good", "#FFA000", 280, 270, "pixel", "50", "left")
	cv.text("okay", "#80FFFF", 280, 320, "pixel", "50", "left")
	cv.text("miss", "#9000D0", 280, 370, "pixel", "50", "left")
	cv.text(`${hits[0]}\n${hits[1]}\n${hits[2]}`, "#FFFFFF", 500, 270, "pixel", "50", "right")
	
	cv.text(`${hits[3]}`, "#FFFFA0", 90, 270, "pixel", "35", "right")
	cv.text("rolls", "#FFEE80", 115, 270, "pixel", "35", "left")
	cv.text(`${hits[5]}`, "#FFB080", 90, 310, "pixel", "35", "right")
	cv.text("combo", "#FF6000", 115, 310, "pixel", "35", "left")
	
	if(!isNaN(accuracy)) cv.text(`${gradeof(accuracy).name}`, gradeof(accuracy).color, 1150, 360, "pixel", "200", "center", false, [accuracy >= 99 ? 20 : 0, gradeof(accuracy).color])
	
	let dHW = [difficulties.hitwindow[selected.difficulty][0], difficulties.hitwindow[selected.difficulty][1], difficulties.hitwindow[selected.difficulty][2]]

	let graphStartX = 154
	let graphEndX = 1382
	let graphStartY = 550
	let graphEndY = 720
	
	cv.rect(clearGauge.mode == "EXHard" ? "#804000" : "#800000", graphEndX-1000, graphStartY - (graphEndY - graphStartY)*0.5 - 22, clearThresh()*10, 22)
	if(clearGauge.mode != "Hard" && clearGauge.mode != "EXHard") cv.rect("#808000", graphEndX-(200 + ((80 - clearThresh())*10)), graphStartY - (graphEndY - graphStartY)*0.5 - 33, (100-clearThresh())*10, 33)
	
	cv.rect(clearGauge.current() < 100 || clearGauge.mode.includes("Hard") ? (clearGauge.mode == "EXHard" ? "#FFA000" : "#FF0000") : hslToHex(Math.floor(performance.now()/11)%360, 100, 50), graphEndX-1000, graphStartY - (graphEndY - graphStartY)*0.5 - 22, Math.min(Math.floor(clearGauge.current()), clearThresh())*10, 22)
	if(!clearGauge.mode.includes("Hard")) cv.rect(clearGauge.current() < 100 ? "#FFFF00" : hslToHex(Math.floor(performance.now()/11)%360, 100, 50), graphEndX-(200 + ((80 - clearThresh())*10)), graphStartY - (graphEndY - graphStartY)*0.5 - 33, (Math.floor(clearGauge.current()) > clearThresh() ? Math.min(Math.floor(clearGauge.current() - clearThresh()), (100-clearThresh())) : 0)*10, 33)
	

	cv.rect("#FFFFFF", graphStartX, (graphStartY - ((graphEndY - graphStartY)*0.5)), (graphEndX - graphStartX), (graphEndY - graphStartY), 5)
	
	let meanMS = (mshits.map(item => item[0])).reduce((a, b) => a + b) / mshits.length;
	
	cv.text(`${dHW[2] * -1000}ms`, "#B0B0B0A0", graphStartX - 10, graphStartY + ((graphEndY - graphStartY)*-0.5) + 10, "pixel", "20", "right")
	cv.text(`${dHW[1] * -1000}ms`, "#B0B0B080", graphStartX - 10, graphStartY + ((graphEndY - graphStartY)*-(dHW[1] / dHW[2])*0.5) + 7.5, "pixel", "16", "right")
	cv.text(`${dHW[0] * -1000}ms`, "#B0B0B080", graphStartX - 10, graphStartY + ((graphEndY - graphStartY)*-(dHW[0] / dHW[2])*0.5) + 6, "pixel", "16", "right")
	cv.text(`${Math.round(meanMS * 10) / 10}ms`, "#B0B0B0A0", graphStartX - 10, graphStartY + ((graphEndY - graphStartY)*(meanMS/1000 / dHW[2])*0.5) + 6, "pixel", "20", "right")
	cv.text(`${dHW[0] * 1000}ms`, "#B0B0B080", graphStartX - 10, graphStartY + ((graphEndY - graphStartY)*(dHW[0] / dHW[2])*0.5) + 3, "pixel", "16", "right")
	cv.text(`${dHW[1] * 1000}ms`, "#B0B0B080", graphStartX - 10, graphStartY + ((graphEndY - graphStartY)*(dHW[1] / dHW[2])*0.5) + 1.5, "pixel", "16", "right")
	cv.text(`${dHW[2] * 1000}ms`, "#B0B0B0A0", graphStartX - 10, graphStartY + ((graphEndY - graphStartY)*0.5), "pixel", "20", "right")
	
	cv.rect("#59B0B080", graphStartX+2.5, graphStartY + ((graphEndY - graphStartY)*(dHW[1]*-1 / dHW[2])*0.5), (graphEndX - graphStartX)-5, (((graphEndY - graphStartY)*-(dHW[1] / dHW[2])*0.5) - ((graphEndY - graphStartY)*-(dHW[0] / dHW[2])*0.5)) * -1)
	cv.rect("#B06D0080", graphStartX+2.5, graphStartY + ((graphEndY - graphStartY)*(dHW[0]*-1 / dHW[2])*0.5), (graphEndX - graphStartX)-5, ((graphEndY - graphStartY)*-(dHW[0] / dHW[2])*0.5) * -1)
	cv.rect("#FFA00040", graphStartX+2.5, graphStartY + ((graphEndY - graphStartY)*(meanMS/1000 / dHW[2])*0.5), (graphEndX - graphStartX)-10, 3)
	cv.rect("#B06D0080", graphStartX+2.5, graphStartY + ((graphEndY - graphStartY)*(dHW[0] / dHW[2])*0.5), (graphEndX - graphStartX)-5, ((graphEndY - graphStartY)*-(dHW[0] / dHW[2])*0.5))
	cv.rect("#59B0B080", graphStartX+2.5, graphStartY + ((graphEndY - graphStartY)*(dHW[1] / dHW[2])*0.5), (graphEndX - graphStartX)-5, ((graphEndY - graphStartY)*-(dHW[1] / dHW[2])*0.5) - ((graphEndY - graphStartY)*-(dHW[0] / dHW[2])*0.5))
	
	for (let i = 0; i < mshits.length; i++) {
		let colorJ;
		if (Math.abs(mshits[i][0]/1000) <= dHW[0]) colorJ = "#FFA000";
		else if (Math.abs(mshits[i][0]/1000) <= dHW[1]) colorJ = "#80FFFF";
		else colorJ = "#9000D0";
		
		cv.circ(colorJ, graphStartX + ((graphEndX - graphStartX) * ((mshits[i][1] - 4)/(mshits[mshits.length-1][1] - 4))) - 2.5, graphStartY + ((graphEndY - graphStartY) * (mshits[i][0]/1000 / (dHW[2]*2.05))), 3)
	}
	
	let ts = ["clear", "#FFFFFF"]
		
	if (hits[2] != 0) {
	if (clearGauge.mode != "Hard" && clearGauge.mode != "EXHard") {
		if (clearGauge.current() >= clearThresh()) {
			switch (clearGauge.mode) {
				case "Easier":
				ts = [`easy clear${clearGauge.current() == 100 ? "+" : ""}`, `#${clearGauge.current() == 100 ? "CCFFCC" : "FFFFFF"}`]
				break;
				case "Easy":
				ts = [`easy clear${clearGauge.current() == 100 ? "+" : ""}`, `#${clearGauge.current() == 100 ? "CCFFCC" : "FFFFFF"}`]
				break;
				case "Normal":
				ts = [`clear${clearGauge.current() == 100 ? "+" : ""}`, `#${clearGauge.current() == 100 ? "CCFFCC" : "FFFFFF"}`]
				break;
			}
		} else ts = ["fail", "#A000E0"]
	} else {
		if (clearGauge.current() > 0) {
			switch (clearGauge.mode) {
				case "Hard":
				ts = [`hard clear${clearGauge.current() == 100 ? "+" : ""}`, `#${clearGauge.current() == 100 ? "FF8080" : "FF0000"}`]
				break;
				case "EXHard":
				ts = [`exhard clear${clearGauge.current() == 100 ? "+" : ""}`, `#${clearGauge.current() == 100 ? "FFB080" : "FF8000"}`]
				break;
			}
		} else ts = ["hard fail", "#FF4000"]
	}
	} else {
		if (hits[0] == 0) ts = ["wow you sure did \"okay\" alright", ["#00FFFF", "#FFFFFF"]]
		else if (hits[1] == 0) ts = ["DONDERFUL COMBO!!", ["#FF8080", "#FFC080", "#FFFF80", "#80FF80", "#80CFFF", "#8080FF", "#E080FF", "#FFFFFF", "#FFFFFF"]]
		else ts = ["FULL COMBO!", ["#FFFF00", "#FFFFA0"]]
	}
	
	cv.text(ts[0], ts[1], 768, 265, "pixel", hits[0] == 0 && hits[2] == 0 ? "25" : "68", "center")
	cv.text(`${clearGauge.mode.toUpperCase()} gauge`, clearGauge.mode == "EXHard" ? "#FFB080" : (clearGauge.mode == "Hard" ? "#FF8080" : "#CCFFCC"), 768, 334, "pixel2", "40", "center")
	
	break;
}

fps[0] = 1000/(performance.now() - lastTime[0])
lastTime[0] = performance.now()

fpsarr[0].push(fps[0])
fpsarr[0].shift();

cv.text(`${Math.round(fps[1])}(${((fpsarr[1].reduce((sum, a) => sum + a, 0))/fpsarr[1].length).toFixed(1)})tps\n${Math.round(fps[0])} (${((fpsarr[0].reduce((sum, a) => sum + a, 0))/fpsarr[0].length).toFixed(1)})fps`, "#FFFFFF60", 0, 764-45, "monospace", "20", "left");
cv.text(`♫⏲ ${songtime.toFixed(3)} (${(4+songtime).toFixed(3)})\n${noteQueue[0] != undefined ? noteQueue[0].position().toFixed(3) + "\n" + ((noteQueue[0].position() - songtime + (pfoffset/1000))*1000).toFixed(2) + "ms" : ""}`, "#FFFFFF60", 1536, 764-65, "monospace", "20", "right");

	} catch (error) {
		cv.rect("#00000090", 0, 250, 1536, 100)
		cv.text(error.stack.toString(), "#FF8080", 1400, 300, "monospace", "15", "right")
		console.log(error.stack)
	}
}
}



//updatePrec
function updatePrec() {
	setTimeout(updatePrec, 1000 / selected.settings.maxTPS);
	try {
	if (songaudios[selected.song] != undefined) songtime = songaudios[selected.song].currentTime;

	if (timefunc[0] != undefined) {
		let tf_i = 0;
		for (tf_i = 0; tf_i < timefunc.length; tf_i++) {
			let currentfunc = timefunc[tf_i]
			if (performance.now() >= currentfunc.time && !currentfunc.executed) {
				currentfunc.funct();
				currentfunc.executed = true;
			} else break;
		}
		timefunc.splice(0, tf_i)
	}

	for (let i = 0; i < bgDensity; i++) {
		if (bgElements.length <= bgDensity) bgElements.push({color: shadeColor(randomColor(), 100), time: performance.now(), x: Math.floor(Math.random() * 1536) + 30})
			else {
				if (764 * (((performance.now() - bgElements[i].time) + (i*-1)*(20000/bgDensity))/12000) > 764+50) bgElements[i].time = performance.now();
			}
	}

	let rolltime = false
	let ib = 0;

	
	for (let i = 0; i < rollQueue.length; i++) {
		if (rollQueue[i].type == 7) ib++;
		if (i % 2 == 0 && rollQueue[i+1] != undefined) {
			if ((rollQueue[i].position() >= rollQueue[i].time) && (rollQueue[i].position() < rollQueue[i+1].time)) {
				rolltime = true; 
				if (balloon.at != ib && rollQueue[i].type == 7) {
					console.log(balloon.at, ib)
					balloon.at = ib;
					balloon.hits = balloon.hitQueue[balloon.at - 1];
				}
				break;
			} else if (balloon.at == ib) balloon.at = 0;
		}
	}

	if (noteQueue[0] != undefined) {
		while ((noteQueue[0].time - noteQueue[0].position()) <= (difficulties.hitwindow[selected.difficulty][2])*-1 && !noteQueue[0].hit) {
			mshits.push([difficulties.hitwindow[selected.difficulty][2]*1000, noteQueue[0].time]);
			noteQueue[0].hit = true;
			noteQueue.shift()
			currentJudgement = ["不可", "#9000D0"];
			hits[2]++;
			hits[4] = 0;
			clearGauge.easier -= (133.333 / songNotes);
			clearGauge.easy -= (133.333 / songNotes);
			clearGauge.normal -= (133.333 / songNotes);
			clearGauge.hard -= (10/3);
			clearGauge.exhard -= (10);
			scoreIncrease();
		}
	}

if (hitting[0] != undefined && mode == 2) {
	if (rolltime) {
		hits[3]++;
		score += 5;
		if (balloon.at != 0) {
			if (balloon.hits > 0 && hitting[0] == 1) balloon.hits--;
			else {hits[3]--; score -= 5;}
		}
		hitting.shift();
		return;
	}
	let typecor = [[1, 3], [2, 4], [1, 3], [2, 4], [1], [1], [1], [1]]
	if (noteQueue[0] != undefined) {
	let precInput = lastKeyPressTime/1000 - timeStarted/1000 - 0.004;
	//let precMS = noteQueue[0].time - precInput;
	let precMS = noteQueue[0].time - noteQueue[0].position();
	//console.log(`${noteQueue[0].time}\n${precInput}\n${precMS}`);
	if (typecor[noteQueue[0].type - 1].includes(hitting[0]) && Math.abs(precMS) <= difficulties.hitwindow[selected.difficulty][2]) {
		mshits.push([(precMS) * -1000, noteQueue[0].time])
		if(Math.abs(precMS) <= difficulties.hitwindow[selected.difficulty][0]) {
			currentJudgement = ["良", "#FFA000"];
			hits[0]++;
			hits[4]++;
			clearGauge.easier += (177.777 / songNotes);
			clearGauge.easy += (155.555 / songNotes);
			clearGauge.normal += (133.333 / songNotes);
			if (clearGauge.hard != 0) clearGauge.hard += 0.075;
			if (clearGauge.exhard != 0) clearGauge.exhard += 0.05;
		}
		else if(Math.abs(precMS) <= difficulties.hitwindow[selected.difficulty][1]) {
			currentJudgement = ["可", "#80FFFF"];
			hits[1]++;
			hits[4]++;
			clearGauge.easier += (88.888 / songNotes);
			clearGauge.easy += (77.777 / songNotes);
			clearGauge.normal += (66.666 / songNotes);
			if (clearGauge.hard != 0) clearGauge.hard += 0.0375;
			if (clearGauge.exhard != 0) clearGauge.exhard += 0.025;
		}
		else {
			currentJudgement = ["不可","#9000D0"];
			hits[2]++;
			hits[4] = 0;
			clearGauge.easier -= (133.333 / songNotes);
			clearGauge.easy -= (133.333 / songNotes);
			clearGauge.normal -= (133.333 / songNotes);
			clearGauge.hard -= (10/3);
			clearGauge.exhard -= 10;
		}
	scoreIncrease();
	noteQueue[0].hit = true;
	noteQueue.shift();
	}
	hitting.shift();
	}
}

clearGauge.easier = Math.min(Math.max(clearGauge.easier, 0), 100)
clearGauge.easy = Math.min(Math.max(clearGauge.easy, 0), 100)
clearGauge.normal = Math.min(Math.max(clearGauge.normal, 0), 100)
clearGauge.hard = Math.min(Math.max(clearGauge.hard, 0), clearGauge.hard <= 0 ? 0 : 100)
clearGauge.exhard = Math.min(Math.max(clearGauge.exhard, 0), clearGauge.exhard <= 0 ? 0 : 100)
//clearGauge.current() = Math.min(Math.max(clearGauge.current(), 0), ((clearGauge.mode == "Hard" || clearGauge.mode == "EXHard") && clearGauge.current() <= 0) ? 0 : 100)

if (selected.settings.GAS) {
	switch (clearGauge.mode) {
		case "EXHard":
			if (clearGauge.exhard == 0) clearGauge.mode = "Hard";
		break;
		
		case "Hard":
			if (clearGauge.hard == 0) clearGauge.mode = "Easier";
		break;

		case "Normal":
			if (clearGauge.normal < 80) clearGauge.mode = "Easy";
		break;
		
		case "Easy":
			if (clearGauge.easy < 72) clearGauge.mode = "Easier";
			if (clearGauge.normal >= 80) clearGauge.mode = "Normal";
		break;
		
		case "Easier":
			if (clearGauge.easy >= 72) clearGauge.mode = "Easy";
		break;
	}
}

if (hits[4] > hits[5]) hits[5] = hits[4]


fps[1] = 1000/(performance.now() - lastTime[1]);
lastTime[1] = performance.now();
fpsarr[1].push(fps[1] == Infinity ? 1000 : fps[1]);
fpsarr[1].shift();
	} catch (error) {
		cv.rect("#00000090", 0, 100, 1536, 100)
		cv.text(error.stack.toString(), "#FF8080", 1400, 500, "monospace", "15", "right")
		console.log(error.stack)
	}
}

class note{
	constructor(type, time, bpm, scroll, offset) {
		this.type = type;
		this.started = timeStarted;
		this.songoffset = this.songoffset = songdata[selected.song] != undefined ? parseFloat(mdValue("OFFSET", songdata[selected.song])) - 4 : offset;
		this.time = time;
		this.position = () => {
			if ((songtime <= 0
			&& songtime < songaudios[selected.song].duration)
			|| !selected.settings.customBuffer) { return (performance.now() - timeStarted)/1000; }
			else return (songtime + 4 + (this.songoffset + 4) - selected.settings.offset/1000);
		};
		this.bpm = bpm;
		this.scroll = scroll;
		this.hit = false;
	}
}

/*
["良", "#FFA000"]
["可", "#80FFFF"]
["不可","#500090"]
*/

function loadChart(ret=false, notPlaying=false, data=false) {
	let psuedoQueue = []; //if notPlaying is true this will be prioritized
	noteQueue = [];
	rollQueue = [];
	barQueue = [];
	let chartData = {};
	if (data != false && typeof data == "object") {
		chartData = {
		fullData: data[0],
		course: data[1],
		bpm: parseFloat(mdValue("BPM:", data[0])),
		offset: Math.max(0, parseFloat(mdValue("OFFSET:", data[0])))-(4-selected.settings.offset/1000),
		courseData: "pending",
		scroll: "pending",
		measure: "pending"
		}
	} else {
		chartData = {
		fullData: songdata[selected.song],
		course: (selected.difficulty != 3 ? selected.difficulty : (uracounter % 20 < 10 ? 3 : 4)),
		bpm: parseFloat(mdValue("BPM:", songdata[selected.song])),
		offset: Math.max(0, parseFloat(mdValue("OFFSET:", songdata[selected.song])))-(4-selected.settings.offset/1000),
		courseData: "pending",
		scroll: "pending",
		measure: "pending"
		}
	}
	chartData.courseData = extractCourse(chartData.course, chartData.fullData, true).replaceAll("\n,\n", "\n0,\n").replaceAll(RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/)|(?://.*)", "g"),"");
	if (!notPlaying) {
		if (selected.settings.defaultGauge == "GAS") {
			selected.settings.GAS = true;
			clearGauge.mode = "EXHard";
		} else {
			selected.settings.GAS = false;
			if(selected.settings.defaultGauge == gaugeNames[0]) clearGauge.mode = difficulties.gauges[selected.difficulty]
			else clearGauge.mode = selected.settings.defaultGauge;
		}
		clearGauge.hard = 100; clearGauge.exhard = 100;
	}
	//console.log(chartData)
	chartData.scroll = 1
	chartData.measure = 4/4;
	if(ret) return chartData
	let currentBeat = 0
	let currentTrueBeat = 0
	let currentBPM = chartData.bpm * (2 ** (selected.mods.songSpeed / 12));
	let currentMeasure = chartData.measure
	let currentScroll = chartData.scroll
	if (mdValue("BALLOON", extractCourse(chartData.course, chartData.fullData, false)) != "") {
		balloon.hitQueue = JSON.parse(`[${mdValue("BALLOON", extractCourse(chartData.course, chartData.fullData, false)).replace(/,$/gm, "")}]`)
	}
	let barlines = true
	let datasplit = chartData.courseData.split("\n")
	let datasplitF = datasplit.filter(item => !(item.at(0) == "#"))
	let g = 0;
	
	for (let j = 0; j < datasplit.length; j++) {
		/*while (datasplit[j].at(0) == "#") {
			let ev = datasplit[j].slice(1, datasplit[j].length).split(" ")
			switch (ev[0]) {
				case "MEASURE":
					currentMeasure = Function("return " + ev[1])();
				break;
				case "SCROLL":
					currentScroll = parseFloat(ev[1]);
				break;
			}
			console.log(datasplit[j])
			datasplit.splice(j, 1)
		}*/
		//while (!datasplitF[j].includes(",") && datasplitF[j+1] != undefined) {console.log(datasplitF[j]); datasplitF[j] += datasplitF[j+1]; datasplitF.splice(j+1, 1); g++;}
		//let dll = (datasplitF[j] == ",") ? ["0"] : datasplitF[j].slice(0, datasplitF[j].indexOf(",")).split("");
		while (!datasplit[j].includes(",") && datasplit[j+1] != undefined) {datasplit[j] += `\n${datasplit[j+1]}`; datasplit.splice(j+1, 1)}
		let dll = datasplit[j].split(",")[0].split("");
		//console.log(dll)
		dll = dll.join("").split("\n").filter(item => item != "")
		//console.log(dll)
		if (dll.length == 0) dll = ["0"]
		ndl = []
		for (k in dll) {
			if (dll[k].at(0) != "#") ndl.push(dll[k].split(""))
		}
		ndl = singleArray(ndl)
		if (ndl.length == 0) ndl = ["0"]
		//console.log(ndl)
		
		for (k = 0; k < dll.length; k++) {
			//console.log(currentBeat)
			if (dll[k].at(0) == "#") {
				let ev = dll[k].split(" ")
				//console.log(ev)
				switch (ev[0]) {
				case "#MEASURE":
					currentMeasure = Function("return " + ev[1])();
				break;
				case "#SCROLL":
					currentScroll = parseFloat(ev[1]);
				break;
				case "#BPMCHANGE":
					let pastBPM = currentBPM
					currentBPM = parseFloat(ev[1]) * (2 ** (selected.mods.songSpeed / 12));
					currentBeat = currentBeat * (currentBPM/pastBPM)
					console.log(pastBPM, currentBPM, currentBeat)
					let tempCurrentBPM = currentBPM
					betterTimeout(() => {ingameBPM = tempCurrentBPM}, ((60/currentBPM*(currentBeat*4))-chartData.offset) * 1000)
				break;
				case "#GOGOSTART":
					betterTimeout(() => {if (!notPlaying) gogo = true}, ((60/currentBPM*(currentBeat*4))-chartData.offset) * 1000 + selected.settings.offset)
				break;
				case "#GOGOEND":
					betterTimeout(() => {if (!notPlaying) gogo = false}, ((60/currentBPM*(currentBeat*4))-chartData.offset) * 1000 + selected.settings.offset)
				break;
				case "#BARLINEOFF":
					barlines = false
				break;
				case "#BARLINEON":
					barlines = true
				break;
			}
			} else {
				dll[k] = dll[k].split("")
				for (let l = 0; l < dll[k].length; l++) {
					if(dll[k][l] != "0") {
						if(dll[k][l] < 5 || dll[k][l] > 8) {
							if (!notPlaying) noteQueue.push(new note(dll[k][l], (60/currentBPM*(currentBeat*4))-chartData.offset, currentBPM, currentScroll, chartData.offset))
								else psuedoQueue.push(new note(dll[k][l], (60/currentBPM*(currentBeat*4))-chartData.offset, currentBPM, currentScroll, chartData.offset))
						}
						else rollQueue.push(new note(dll[k][l], (60/currentBPM*(currentBeat*4))-chartData.offset, currentBPM, currentScroll, chartData.offset))
					}
					if(Math.abs(currentTrueBeat - Math.round(currentTrueBeat)) < 0.000001 && barlines) {
						barQueue.push(new note(0, (60/currentBPM*(currentBeat*4))-chartData.offset, currentBPM, currentScroll, chartData.offset))
					}
					//console.log((60/currentBPM*(currentBeat*4))-chartData.offset)
					//console.log(currentBeat)
					currentBeat += ((1/ndl.length)*currentMeasure)
					currentTrueBeat += (1/ndl.length)
				}
			}
		}
	}
	if (notPlaying) {
		setTimeout(() => {rollQueue = []; barQueue = []}, 500)
		return psuedoQueue;
	}
	songNotes = noteQueue.length;
	ingameBPM = chartData.bpm;
	rrq(100);
	betterTimeout(() => {clearShow = true; betterTimeout(() => {fadetomode(3)}, 5000)}, ((60/currentBPM*(currentBeat*4))-chartData.offset)*1000)
		//soundManager.setVolume(selected.settings.volume)
		for(let i = 0; i < songaudios.length; i++) {songaudios[i].volume = selected.settings.volume/100}
		for(let i = 0; i < sfxaudios.length; i++) {sfxaudios[i].volume = selected.settings.volume/100}
		songaudios[selected.song].currentTime = 0
		//songaudios[selected.song].play();
		songaudios[selected.song].volume = selected.settings.volume * 0.001
		pfoffset = (parseFloat(mdValue("OFFSET", songdata[selected.song]))*1000) / (2 ** (selected.mods.songSpeed / 12))
		betterTimeout(() => {
		if (pfoffset > 0) {
			console.log("1st con");
			betterTimeout(() => {songaudios[selected.song].play(); songaudios[selected.song].currentTime = 0; songaudios[selected.song].volume = selected.settings.volume/100}, pfoffset)
		} else {
			console.log("2nd con");
			songaudios[selected.song].currentTime = (Math.max(0, pfoffset*-1-4000))/1000;
			songaudios[selected.song].volume = selected.settings.volume/100;
			songaudios[selected.song].play();
		}
		}, Math.min(4000, 4000+pfoffset));
		betterTimeout(() => {if (noteQueue[0] != undefined && !selected.settings.customBuffer) songaudios[selected.song].currentTime = (noteQueue[0].position() - pfoffset/1000 - 4) * songaudios[selected.song].playbackRate}, Math.min(4500 + pfoffset, 4500));
}

function betterTimeout(func, ms) {
	if (typeof func != "function") console.warn("the first value needs to be a function")
	else {
		timefunc.push({funct: func, time: performance.now() + ms, executed: false});
		
		timefunc.sort(function(a, b) {
			return ((a.time < b.time) ? -1 : ((a.time == b.time) ? 0 : 1));
		});
	}
}

function controlInit(keys = ["d", "f", "j", "k"]) {
if (selected.settings.controls != undefined) {
for (let i = 0; i < selected.settings.controls.length; i++) {
	Mousetrap.unbind(selected.settings.controls[i], "keydown");
}
}
selected.settings.controls = keys;
Mousetrap.bind(selected.settings.controls[0], function() {
	if (canSelect) {
		if (mode == 1) {
			switch(selected.selection) {
			case "song":
			if (selected.song > -1) {
				selected.song--;
				//soundManager.stopAll();
				for(let i = 0; i < songaudios.length; i++) {songaudios[i].pause()}
				for(let i = 0; i < sfxaudios.length; i++) {sfxaudios[i].pause()}
				sfxaudios[1].currentTime = 0;
				sfxaudios[1].play();
				if(selected.song != -1) {
				songaudios[selected.song].currentTime = parseFloat(mdValue("DEMOSTART", songdata[selected.song]));
				songaudios[selected.song].play();
				}
			}
			break;
			
			case "difficulty":
			sfxaudios[1].currentTime = 0;
			sfxaudios[1].play();
			if (selected.difficulty > -1 && (selected.difficulty > -1 || selected.song > -1)) selected.difficulty--
			break;
			}
		}
	}
}, "keydown")

Mousetrap.bind([selected.settings.controls[1], selected.settings.controls[2]], function() {
	if (canSelect) {
		if (mode == 0) fadetomode(1)
		if (mode == 1) {
		sfxaudios[0].currentTime = 0;
		sfxaudios[0].play();
		switch(selected.selection) {
			case "song":
			selected.difficulty = 0
			selected.selection = "difficulty"
			break;
			
			case "mods":
			
			break;
			
			case "difficulty":
			if(selected.difficulty > -1) {
				if(selected.song == -1) {
					let range = selected.settings.range[selected.difficulty]
					if(typeof range == "object") {
						let a = prompt(`Input a number between ${range[0]} and ${range[1]}.`)
						a = Math.max(Math.min(parseFloat(a), range[1]), range[0])
						if (!isNaN(a)) {
						selected.settings.amounts[selected.difficulty] = a;
						if (selected.difficulty == 0) {
							selected.settings.volume = a;
							for(let i = 0; i < songaudios.length; i++) {songaudios[i].volume = selected.settings.volume/100}
							for(let i = 0; i < sfxaudios.length; i++) {sfxaudios[i].volume = selected.settings.volume/100}
						};
						if (selected.difficulty == 1) selected.settings.offset = a;
						if (selected.difficulty == 5) {
							selected.settings.maxFPS = a
							//if (!selected.settings.vsync) {
							//clearInterval(frameInterval);
							//frameInterval = setInterval(update, 1000/selected.settings.maxFPS);
							//}
						}
						if (selected.difficulty == 6) {
							selected.settings.maxTPS = a;
							//clearInterval(tickInterval);
							//tickInterval = setInterval(updatePrec, 1000/selected.settings.maxTPS);
						}
						}
					} else {
						range();
						if (selected.difficulty == 2) selected.settings.amounts[2] = selected.settings.customBuffer;
						if (selected.difficulty == 3) selected.settings.amounts[3] = selected.settings.defaultGauge;
						if (selected.difficulty == 4) 
						if (selected.difficulty == 4) {
							selected.settings.amounts[4] = selected.settings.vsync;
							if (!selected.settings.vsync) {
								//frameInterval = setInterval(update, 1000/selected.settings.maxFPS);
							} else {
								//clearInterval(frameInterval);
								//window.requestAnimationFrame(update);
							}
						}
						if (selected.difficulty == 5) selected.settings.amounts[6] = selected.settings.maxFPS;
						if (selected.difficulty == 6) selected.settings.amounts[6] = selected.settings.maxTPS;
					}
				} else fadetomode(2);
			}
			else {
				if (selected.difficulty == -2) {
					selected.selection = "mods";
					selected.difficulty = 0;
					break;
				}
				selected.selection = "song"; 
				selected.difficulty = -3;
				/*if (uracounter % 20 >= 10) {
				let a = [difficulties.names[3], difficulties.colors[3]];
				difficulties.names[3] = difficulties.names[4];
				difficulties.names[4] = a[0];
				difficulties.colors[3] = difficulties.colors[4];
				difficulties.colors[4] = a[1];
				}*/
				uracounter = 0
			}
			break;
		}
		}
		if (mode == 3) fadetomode(1);
	}
}, "keydown")

Mousetrap.bind(selected.settings.controls[3], function() {
	if (canSelect) {
		if (mode == 1) {
			switch(selected.selection) {
			case "song":
			if (selected.song < songdata.length-1) {
				selected.song++;
				//soundManager.stopAll();
				for(let i = 0; i < songaudios.length; i++) {songaudios[i].pause()}
				for(let i = 0; i < sfxaudios.length; i++) {sfxaudios[i].pause()}
				sfxaudios[1].currentTime = 0;
				sfxaudios[1].play();
				songaudios[selected.song].currentTime = parseFloat(mdValue("DEMOSTART", songdata[selected.song]));
				songaudios[selected.song].play();
			}
			break;
			
			case "difficulty":
			sfxaudios[1].currentTime = 0;
			sfxaudios[1].play();
			let limit = selected.song == -1 ? selected.settings.names.length-1 : 3
			if (selected.difficulty < limit) selected.difficulty++
			else {
			if (selected.song > -1) {
			if (hasCourse("4", songdata[selected.song])) uracounter++
			/*if (uracounter % 20 == 10 || uracounter % 20 == 0 && hasCourse("4", songdata[selected.song])) {
				let a = [difficulties.names[3], difficulties.colors[3]];
				difficulties.names[3] = difficulties.names[4];
				difficulties.names[4] = a[0];
				difficulties.colors[3] = difficulties.colors[4];
				difficulties.colors[4] = a[1];
			}*/
			}
			}
			break;
			}
		}
	}
}, "keydown")
}

if (selected.settings.controls != undefined) {
	if (!selected.settings.controls.includes("") && selected.settings.controls.length == 4) controlInit(selected.settings.controls);
	else controlInit(["d", "f", "j", "k"]);
}
else controlInit(["d", "f", "j", "k"]);

Mousetrap.bind("shift+j+p", function() {convertLanguage("JP")})

Mousetrap.bind("shift+s+up", function() {selected.mods.songSpeed++; modApply();})
Mousetrap.bind("shift+s+down", function() {selected.mods.songSpeed--; modApply();})

Mousetrap.bind("shift+s+d", function() {
	if (canSelect && mode < 2) {
		//songdata.sort((a, b)=>{return parseFloat(mdValue("LEVEL", extractCourse(3, a))) - parseFloat(mdValue("LEVEL", extractCourse(3, b)))})
		let c = [];
		let level = function (data) {
			let temp = parseFloat(mdValue("LEVEL", extractCourse(3, data)))
			if (mdValue("DIFPLUS3", extractCourse(3, data)) != "") temp += 0.75;
			else {
				if (temp == Math.floor(temp)) temp += 0.5;
			}
			console.log(temp)
			return temp
		}
		for (let i = 0; i < songdata.length; i++) {c.push({'data': songdata[i], 'audio': songaudios[i], 'starry': starry[i], 'bpm': songbpms[i]})}
		c.sort(function(a, b) {
			return ((level(a.data) < level(b.data)) ? -1 : ((level(a.data) == level(b.data)) ? 0 : 1));
		});
		for (let i = 0; i < c.length; i++) {
			songdata[i] = c[i].data;
			songaudios[i] = c[i].audio;
			starry[i] = c[i].starry;
			songbpms[i] = c[i].bpm;
		}
	}
})

Mousetrap.bind("esc", function() {
	if (canSelect) {
	if (mode == 1) fadetomode(0)
	if (mode == 2 && noteQueue.length > 0) {
		while (noteQueue.length > 0) noteQueue.shift();
		while (barQueue.length > 0) barQueue.shift();
		while (timefunc.length > 0) timefunc.shift();
		fadetomode(1);
	}
	}
}, "keydown")

Mousetrap.bind("s+c+p", function() {
	if (canSelect && mode == 3 && cansubmit) {
		scoreQueue.push(true);
		cansubmit = false;
		sfxaudios[3].volume = selected.settings.volume/100;
		sfxaudios[3].play();
	}
})

Mousetrap.bind("shift+k+b", function() {
	let pendingKB = [];
	pendingKB.push(prompt("Input your left ka key. (Key #1)"));
	pendingKB.push(prompt("Input your left don key. (Key #2)"));
	pendingKB.push(prompt("Input your right don key. (Key #3)"));
	pendingKB.push(prompt("Input your right ka key. (Key #4)"));
	controlInit(pendingKB);
});

Mousetrap.bind("shift+right", function() {
	playfieldX += 5;
})
Mousetrap.bind("shift+left", function() {
	playfieldX -= 5;
})

function customChartUpload() {
	alert("Select two files. One should be audio, and the other should be your tja file. Note that depending on the syntax of the tja, some charts may not work properly.");
	
	let fu = document.createElement('input');
	let file = {audio: 0, data: 0}
	fu.setAttribute("type", "file");
	fu.setAttribute("multiple", "");
	//fu.setAttribute("accept", "audio/*");
    fu.onchange = () => {
         file.audio = fu.files[0].type.startsWith("audio/") ? fu.files[0] : fu.files[1];
		 let reader = new FileReader();
		 reader.onload = function(e) {
			let srcUrl = e.target.result;
			//songaudios.push(soundManager.createSound({url: srcUrl, autoLoad: true, stream: true}));
			songaudios.push(new Audio(srcUrl))
			songaudios[songaudios.length - 1].volume = selected.settings.volume/100;
		 };
		 reader.readAsDataURL(file.audio);
		 
         file.data = fu.files[0].type.startsWith("audio/") ? fu.files[1] : fu.files[0];
		 
		 console.log(file.audio.type, file.data.type);
		 let reader2 = new FileReader();
		 let readAsBinaryYet = false;
		 reader2.onload = function(e) {
			let encodingMethod = jschardet.detect(e.target.result).encoding;
			//console.log(encodingMethod);
			if (!readAsBinaryYet) {
				readAsBinaryYet = true;
				reader2.readAsText(file.data, encodingMethod);
			} else {
			console.log(e.target.result);
			songdata.push(e.target.result);
			songdata[songdata.length-1] = songdata[songdata.length-1].replaceAll("\r", "")
			songINIT();
			console.log(file.audio.type, file.data.type);
			}
		 };
		 //reader2.readAsText(file.data, 'shift-jis');
		 reader2.readAsBinaryString(file.data);
		 
		 //selected.settings.customBuffer = true; selected.settings.amounts[2] = true;
	};
	fu.click();
}

let frameInterval;
//let tickInterval = setInterval(updatePrec, 1000/selected.settings.maxTPS)
updatePrec();
setInterval(() => {tipnum = Math.floor(Math.random() * tips.length)}, 12500)



function songINIT() {
	songbpms = []
	starry = []
	for (let i = 0; i < songdata.length; i++) {
		if(!songdata[i].startsWith("\n"))songdata[i] = `\n${songdata[i]}`
		songbpms.push([])
		songbpms[i].push(mdValue("BPM:", songdata[i]));
		songbpms[i].push(mdValue("#BPMCHANGE", songdata[i], 1, true))
		if (songbpms[i].length > 1) {
			//console.log(songbpms[i])
			songbpms[i] = singleArray([[songbpms[i][0]], songbpms[i][1]])
			songbpms[i] = songbpms[i].sort(function(a, b) {return parseFloat(a) - parseFloat(b)})
		}
		songdata[i] = songdata[i].replaceAll(RegExp("COURSE:Dan", "gmi"), "COURSE:6").replaceAll(RegExp("COURSE:Edit", "gmi"), "COURSE:4").replaceAll(RegExp("COURSE:Oni", "gmi"), "COURSE:3").replaceAll(RegExp("COURSE:Hard", "gmi"), "COURSE:2").replaceAll(RegExp("COURSE:Normal", "gmi"), "COURSE:1").replaceAll(RegExp("COURSE:Easy", "gmi"), "COURSE:0")
		songdata[i] = songdata[i].replaceAll(RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/)|(?://.*)", "gm"), "")
		
		starry.push([])
		for (let j = 0; j <= 3 + (songdata[i].includes("COURSE:4")); j++) {
			starry[i].push(starOf(i, j));
		}
	}
}

songINIT();

function report(text, time = 3) {
	let reporter = document.getElementById("reporter");
	reporter.innerHTML = text;
	reporter.style.filter = "opacity(75%)"
	betterTimeout(() => {reporter.style.filter = "opacity(0%)"}, time*1000)
}



cv.text("click or press a key to load the game\nand have fun :D", "#FFFFFF", 768, 382, "monospace", "25", "center")

let activation = setInterval(() => {
if (navigator.userActivation != undefined) {
if (navigator.userActivation.isActive) {
	mode = 0;
	selected.song = Math.floor(Math.random() * songdata.length)
	betterTimeout(() => {
		for(let i = 0; i < songaudios.length; i++) {songaudios[i].volume = selected.settings.volume/100}
		for(let i = 0; i < sfxaudios.length; i++) {sfxaudios[i].volume = selected.settings.volume/100}
	songaudios[selected.song].play();
	}, 500)
	betterTimeout(() => {window.requestAnimationFrame(update)}, 500);
	clearInterval(activation);
}
} else {
	mode = 0;
	selected.song = Math.floor(Math.random() * songdata.length)
	betterTimeout(() => {
		for(let i = 0; i < songaudios.length; i++) {songaudios[i].volume = selected.settings.volume/100}
		for(let i = 0; i < sfxaudios.length; i++) {sfxaudios[i].volume = selected.settings.volume/100}
	songaudios[selected.song].play();
	}, 500)
	betterTimeout(() => {window.requestAnimationFrame(update)}, 500);
	clearInterval(activation);
}
}, 1)

