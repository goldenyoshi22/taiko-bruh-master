var cDate = new Date();
var timefunc = [() => {}, 0, true] //function, time, executed already
var debug = false
var debugval = [0, false]

var controls = ["d", "f", "j", "k"]

let tipnum = Math.floor(Math.random() * tips.length)

let difficulties = {
	names:  ["Easy",    "Normal",  "Hard",    "Extreme", "Extra"],
	colors: ["#FF0000", "#00FF00", "#0080FF", "#C000FF", "#0000FF"],
	gauges: ["Beginner", "Easy", "Easy", "Normal", "Normal"],
	stars:  [5,         7,         8,         10,        10],
	hitwindow: [[0.042, 0.108, 0.125], [0.042, 0.108, 0.125], [0.025, 0.075, 0.108], [0.025, 0.075, 0.108], [0.025, 0.075, 0.108]]
}

Mousetrap.addKeycodes({
	144: 'numlock'
})

var res = [window.innerWidth, window.innerWidth / 2.010471204188482];

for (i = 0; i < 1; i++) {
console.log((res[0]/2) - (50*(i-3.5))+4)
}

console.log(`Hey, are you testing?\nDon't cheat!\n\nねぇ、 テストしていますか?\nずるしないでください。`);

//setting the canvas resolution
ID("gameCanvas").width = res[0];
ID("gameCanvas").height = res[1];

cv.scale(res[0] / 1536, res[1] / 764);

//menu stuff
let selected = {
	song: 0,
	difficulty: -2,
	selection: "song",
	settings: {
		volume: 10,
		offset: 0,
	}
}
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

//song stuff

let songNotes = 0
let clearGauge = [0, "Normal"]
let clearShow = false
let clearThresh = () => {return (clearGauge[1] == "Normal" ? 80 : (clearGauge[1] == "Easy" ? 70 : (clearGauge[1] == "Beginner" ? 60 : 100)))}
let noteQueue = []
let renderQueue = []

function rrq(n = Infinity) {
	if (n == Infinity) {
		renderQueue = [...noteQueue].sort(function(a, b){return a.scroll*a.bpm - b.scroll*b.bpm})
	} else {
		renderQueue = []
		for (let i = 0; i < n && noteQueue[i] != undefined; i++) {
			renderQueue.push(noteQueue[i])
			renderQueue = [...renderQueue].sort(function(a, b){return a.scroll*a.bpm - b.scroll*b.bpm})
		}
	}
}

let rollQueue = []
let balloon = {at: 0, hits: 0, next: 1, hitQueue: []}
let eventQueue = []
let currentJudgement = ["", ""]
let hits = [0, 0, 0, 0, 0, 0] //good, ok, bad, rolls, combo, maxcombo
let hitting = 0
let gogo = false
let songaudios = []

function sload() {
  for (let i = 0; i < songdata.length; i++) {
	  songaudios.push(soundManager.createSound({url: mdValue("WAVE", songdata[i])}));
  }
}

//other stuff
var bgDensity = 50
let bgElements = []
//color, time, x

var fps = 60
var fpsarr = []

let fadetomode = async (m) => {
	canSelect = false
	for (let j = 0; j < 255; j+=6) {
		await new Promise(r => setTimeout(r, 8));
		ID("blackTop").style.backgroundColor = `#000000${j.toString(16)}`;
		soundManager.setVolume((selected.settings.volume+1) - (1.1**j))
	}
	await new Promise(r => setTimeout(r, 250))
	mode = m;
	canSelect = true
	
	if (mode == 1) {
		balloon.at = 0; balloon.next = 1; selected.selection = "song"; selected.difficulty = -2; clearGauge[0] = 0; combo = 0; hits = [0, 0, 0, 0, 0, 0]; currentJudgement = ["", ""]; clearShow = false;
		
		if (uracounter % 20 >= 10) {
			let a = [difficulties.names[3], difficulties.colors[3]];
			difficulties.names[3] = difficulties.names[4];
			difficulties.names[4] = a[0];
			difficulties.colors[3] = difficulties.colors[4];
			difficulties.colors[4] = a[1];
		}
				
		uracounter = 0;
		
		soundManager.setVolume(selected.settings.volume)
		songaudios[selected.song].setPosition(parseFloat(mdValue("DEMOSTART", songdata[selected.song]))*1000)
	}
	
	if (mode == 2) {
		soundManager.stopAll();
		timeStarted = performance.now();
		loadChart();
		soundManager.setVolume(selected.settings.volume)
		songaudios[selected.song].setPosition(0)
		betterTimeout(() => {
		if (parseFloat(mdValue("OFFSET", songdata[selected.song]))*1000 > 0) {
			betterTimeout(() => {songaudios[selected.song].play()}, parseFloat(mdValue("OFFSET", songdata[selected.song]))*1000)
		} else {
			songaudios[selected.song].setPosition(parseFloat(mdValue("OFFSET", songdata[selected.song]))*1000)
			songaudios[selected.song].play();
		}
		}, 4000)
	}
	
	for (let j = 255; j > 0; j-=4) {
		await new Promise(r => setTimeout(r, 8));
		ID("blackTop").style.backgroundColor = `#000000${j.toString(16)}`;
	}
	
}

let lastTime = 0;

//draw on the canvas for the game
function update() {
cv.clear();

for (let i = 0; i < bgElements.length; i++) {
	cv.circ(bgElements[i].color + "60", bgElements[i].x, 764 * (((performance.now() - bgElements[i].time) + (i*-1)*400)/12000), 30, false, [60, bgElements[i].color])
}
	cv.rect(`#${clearGauge[0] >= clearThresh() ? "FFFF00" : "000000"}${(clearGauge[1].includes("Hard") && clearGauge[0] == 0) ? "60" : "1A"}`, 0, 0, 1536, 764)

switch (mode) {

case -1:
break;	

//title
case 0:

cv.text("taiko bruh master", ["#FF0000", "#00FFFF"], 768, 275, "pixel", "90", "center");
cv.text("press enter to start!", `#FFFFFF${numtobase(Math.floor(Math.abs(Math.sin((performance.now()-500) / 450)*100)) + 5, 16).padStart(2, "0")}`, 768, 400, "pixel", "65", "center");
cv.text("(controls are DFJK.)", `#FFFFFFA0`, 768, 600, "pixel", "40", "center");

cv.text(tips[tipnum], ["#FF8080", "#80FFFF"], 768, 715, "pixel2", "35", "center")

cv.text("α.0.0\nhttps://discord.gg/2D2XbD77HD", "#DDDDDD50", 0, 30, "monospace", "25", "left");
break;

//song select
case 1:
	cv.rect("#FFCC99", 30, (100 * (-1-selected.song)) + 320, 500, 80);
	if (selected.song != -1) cv.rect("#000000", 35, (100 * (-1-selected.song)) + 325, 490, 70);
	cv.text("Settings", (selected.song != -1 ? "#FFCC99" : "#000000"), 280, (100 * (-1-selected.song)) + 365, "pixel", "30", "center");

for (let i = 0; i < songdata.length; i++) {
	cv.rect("#00C0FF", 30, (100 * (i-selected.song)) + 320, 500, 80);
	if (selected.song != i) cv.rect("#000000", 35, (100 * (i-selected.song)) + 325, 490, 70);
	cv.text(mdValue("TITLE", songdata[i]), (selected.song != i ? "#00C0FF" : "#000000"), 280, (100 * (i-selected.song)) + 365, "pixel", (mdValue("TITLE", songdata[i]).length > 33 ? (29 * (33 / mdValue("TITLE", songdata[i]).length)).toString() : "30"), "center");
}

cv.rect("#00FFFF", 650, 20, 850, 724);
cv.rect("#000000", 655, 25, 840, 714);
if(selected.song != -1) {
cv.text("Length: " + lengthOfTime(songaudios[selected.song].durationEstimate), "#00C0C0", 665, 65, "pixel", "30", "left");
cv.text(mdValue("TITLE", songdata[selected.song]), "#00FFFF", 1075, 150, "pixel", (mdValue("TITLE", songdata[selected.song]).length > 24 ? (69 * (24 / mdValue("TITLE", songdata[selected.song]).length)).toString() : "70"), "center");
cv.text(mdValue("SUBTITLE", songdata[selected.song]).slice(2), "#00FFFF", 1075, 225, "pixel", "35", "center");
}

cv.rect("#FFA000", 720, 580, 100, 100);
if (selected.difficulty != -1) cv.rect("#000000", 725, 585, 90, 90);
cv.text("Back", (selected.difficulty != -1 ? "#FFA000" : "#000000"), 770, 635, "pixel", "20", "center")
	

for (let i = 0; i < 4; i++) {
	if (selected.song != -1) {
	if(i == 3 && hasCourse("4", songdata[selected.song]) && uracounter % 20 >= 10) i++;
	let levelc = parseInt(mdValue("LEVEL", extractCourse(i, songdata[selected.song])));
	if (isNaN(levelc)) continue;
	let hasplus = (!isNaN(parseInt(mdValue("DIFPLUS", extractCourse(i, songdata[selected.song])))) || (mdValue("LEVEL", extractCourse(i, songdata[selected.song])) - levelc) >= 0.75)
	let hasminus = ((mdValue("LEVEL", extractCourse(i, songdata[selected.song])) - levelc) <= 0.25 && (mdValue("LEVEL", extractCourse(i, songdata[selected.song])) - levelc) != 0);
	if(i==4)i=3;
	cv.rect(difficulties.colors[i], 720 + 180 * i, 400, 165, 165);
	if (selected.difficulty != i) cv.rect("#000000", 725 + 180 * i, 405, 155, 155);
	cv.rect((selected.difficulty != i ? difficulties.colors[i] + "50" : "#0000001A"), 720 + 180 * i, 565 - (165 * (levelc / difficulties.stars[i])), 165, (165 * (levelc / difficulties.stars[i])));
	cv.text(difficulties.names[i], (selected.difficulty != i ? difficulties.colors[i] : "#000000"), 805 + 180*i, 450, "pixel", "40", "center")
	cv.text(levelc, (selected.difficulty != i ? difficulties.colors[i] : "#000000"), 805 + 180*i, 520, "pixel2", "60", "center")
	if (hasplus) cv.text("+", (selected.difficulty != i ? shadeColor(difficulties.colors[i], 50) : "#000000"), 835 + 180*i, 500, "pixel2", (i > 1 ? "33" : "22"), "center")
	else if (hasminus) cv.text("-", (selected.difficulty != i ? shadeColor(difficulties.colors[i], 50) : "#000000"), 835 + 180*i, 500, "pixel", (i > 1 ? "33" : "22"), "center")
	}
}

cv.rect("#00000080", 0, 680, 1536, 1500)
cv.text(tips[tipnum], ["#FF8080", "#80FFFF"], 768, 715, "pixel2", "35", "center")
break;

//game
case 2:
	cv.rect(gogo ? "#FFCCCC" : "#FFFFFF", 170, 180, 2000, 150)
	cv.rect(gogo ? "#661133" : "#111111", 175, 185, 2000, 140)
	cv.circ("#FFFFFFA0", 260, 253, 50, 3)
	cv.circ("#FFFFFFD0", 260, 253, 30, 5)
	
	cv.rect(clearGauge[1] == "EXHard" ? "#804000" : "#800000", 1536-1200, 158, clearThresh()*10, 22)
	if(clearGauge[1] != "Hard" && clearGauge[1] != "EXHard") cv.rect("#808000", 1536-(400 + ((80 - clearThresh())*10)), 147, (100-clearThresh())*10, 33)
	
	cv.rect(clearGauge[0] < 100 || clearGauge[1] == "Hard" || clearGauge[1] == "EXHard" ? (clearGauge[1] == "EXHard" ? "#FF8000" : "#FF0000") : `hsl(${Math.floor((performance.now()/11)%360)}, 100%, 50%)`, 1536-1200, 158, Math.min(Math.floor(clearGauge[0]), clearThresh())*10, 22)
	if(clearGauge[1] != "Hard" && clearGauge[1] != "EXHard") cv.rect(clearGauge[0] < 100 ? "#FFFF00" : `hsl(${Math.floor((performance.now()/11)%360)}, 100%, 50%)`, 1536-(400 + ((80 - clearThresh())*10)), 147, (Math.floor(clearGauge[0]) > clearThresh() ? Math.min(Math.floor(clearGauge[0] - clearThresh()), (100-clearThresh())) : 0)*10, 33)

	let colorn = ["", "#FF0000", "#00D0FF", "#FF1010", "#10E0FF", "#FFA000", "#FFA000", "#FF3010", "#00FF00"]
	let isbig = (t) => {return t == 3 || t == 4 || t == 6}
	
	for (i in renderQueue) {
		if (!renderQueue[i].hit) {
		cv.circ(colorn[renderQueue[i].type], 260 + ((renderQueue[i].time - renderQueue[i].position()) * renderQueue[i].bpm*renderQueue[i].scroll*3.6), 253, 30 + (20*isbig(renderQueue[i].type)))
		cv.circ("#FFFFFFDD", 260 + ((renderQueue[i].time - renderQueue[i].position()) * renderQueue[i].bpm*renderQueue[i].scroll*3.6), 253, 30 + (20*isbig(renderQueue[i].type)), 4 + (2*isbig(renderQueue[i].type)))
		}
		
		//console.log(260 + ((noteQueue[i].time - noteQueue[i].position()) * noteQueue[i].bpm*noteQueue[i].scroll*0.5))
	}
	
	for (i in rollQueue) {
		//console.log(rollQueue)
		i = parseInt(i) //why do i need to do this??
		if (i % 2 == 0 && rollQueue[i+1] != undefined) {
		cv.rect(colorn[rollQueue[i].type], 260 + ((rollQueue[i].time - rollQueue[i].position()) * rollQueue[i].bpm*rollQueue[i].scroll*3.6), 253 - ((30 + (20*isbig(rollQueue[i].type)))), ((rollQueue[i+1].time - rollQueue[i].time) * rollQueue[i].bpm*rollQueue[i].scroll*3.6), (30 + (20*isbig(rollQueue[i].type))) * 2)
		cv.circ(colorn[rollQueue[i].type], 260 + ((rollQueue[i].time - rollQueue[i].position()) * rollQueue[i].bpm*rollQueue[i].scroll*3.6), 253, 30 + (20*isbig(rollQueue[i].type)));
		cv.circ(colorn[rollQueue[i].type], 260 + ((rollQueue[i+1].time - rollQueue[i+1].position()) * rollQueue[i].bpm*rollQueue[i].scroll*3.6), 253, 30 + (20*isbig(rollQueue[i].type)))
		}
	}
	
	cv.text((balloon.at != 0 && balloon.hits != 0) ? balloon.hits : "", "#FFFFFF", 260, 150, "pixel", "45", "center")
	cv.text(currentJudgement[0], currentJudgement[1], 260, 220, "pixel", "40", "center")
	cv.text(mdValue("TITLE", songdata[selected.song]), "#FFFFFF", 1536, 50, "pixel", "50", "right")
	let a = (selected.difficulty == 3 && hasCourse("4", songdata[selected.song]) && uracounter % 20 >= 10) ? 1 : 0
	let levelc = parseInt(mdValue("LEVEL", extractCourse(selected.difficulty+a, songdata[selected.song])));
	let hasplus = (!isNaN(parseInt(mdValue(`DIFPLUS${selected.difficulty+a}`, extractCourse(selected.difficulty+a, songdata[selected.song])))) || (mdValue("LEVEL", extractCourse(selected.difficulty+a, songdata[selected.song])) - levelc) >= 0.75)
	console.log("a")
	let hasminus = ((mdValue("LEVEL", extractCourse(selected.difficulty+a, songdata[selected.song])) - levelc) <= 0.25 && (mdValue("LEVEL", extractCourse(selected.difficulty+a, songdata[selected.song])) - levelc) != 0);
	cv.text(`${difficulties.names[selected.difficulty]} ☆${parseInt(mdValue("LEVEL", extractCourse(selected.difficulty != 3 ? selected.difficulty : (difficulties.names[3] == "Extreme" ? 3 : 4), songdata[selected.song])))}${hasplus ? "+" : (hasminus ? "-" : "")}`, difficulties.colors[selected.difficulty], 1536, 100, "pixel", "35", "right")
	cv.text("良", "#FFA000", 240, 420, "pixel", "35", "left")
	cv.text("可", "#80FFFF", 240, 455, "pixel", "35", "left")
	cv.text("不可", "#9000D0", 240, 490, "pixel", "35", "left")
	cv.text("連打", "#FF9020", 240, 525, "pixel", "35", "left")
	cv.text("コンボ", "#FF6000", 240, 560, "pixel", "35", "left")
	cv.text(hits[4], "#FFFFFFA0", 150, 253, "pixel", "30", "center")
	cv.text(`${hits[0]}\n${hits[1]}\n${hits[2]}\n${hits[3]}\n${hits[5]}`, "#FFFFFF", 400, 420, "pixel", "35", "right")
	cv.text(`${Math.round(((hits[0]*100 + hits[1]*50) / (hits[0]+hits[1]+hits[2])) * 100) / 100}%`, "#FFFFFF", 240, 600, "pixel", "35", "left")
	
	if (clearShow) {
		let ts = ["clear", "#FFFFFF"]
		
		if (hits[2] != 0) {
		if (clearGauge[1] != "Hard" && clearGauge[1] != "EXHard") {
			if (clearGauge[0] >= clearThresh()) {
				switch (clearGauge[1]) {
					case "Beginner":
					ts = [`easier clear${clearGauge[0] == 100 ? "+" : ""}`, `#${clearGauge[0] == 100 ? "CCFFCC" : "FFFFFF"}`]
					break;
					case "Easy":
					ts = [`easy clear${clearGauge[0] == 100 ? "+" : ""}`, `#${clearGauge[0] == 100 ? "CCFFCC" : "FFFFFF"}`]
					break;
					case "Normal":
					ts = [`clear${clearGauge[0] == 100 ? "+" : ""}`, `#${clearGauge[0] == 100 ? "CCFFCC" : "FFFFFF"}`]
					break;
				}
			} else ts = ["fail", "#A000E0"]
		} else {
			if (clearGauge[0] > 0) {
				switch (clearGauge[1]) {
					case "Hard":
					ts = [`hard clear${clearGauge[0] == 100 ? "+" : ""}`, `#${clearGauge[0] == 100 ? "FF8080" : "FF0000"}`]
					break;
					case "EXHard":
					ts = [`exhard clear${clearGauge[0] == 100 ? "+" : ""}`, `#${clearGauge[0] == 100 ? "FF8000" : "FFB080"}`]
					break;
				}
			} else ts = ["hard fail", "#FF4000"]
		}

	} else {
		if (hits[1] == 0) ts = ["DONDERFUL COMBO!!", ["#FF8080", "#FFC080", "#FFFF80", "#80FF80", "#80CFFF", "#8080FF", "#E080FF", "#FFFFFF", "#FFFFFF"]]
		else ts = ["FULL COMBO!", ["#FFFF00", "#FFFFA0"]]
	}
	cv.text(ts[0], ts[1], 1536/1.66, 265, "pixel", "60", "center")
	}
break;
}

fps = 1000/(performance.now() - lastTime)
lastTime = performance.now()

fpsarr.push(fps)

cv.text(`${Math.round(fps)}fps`, "#FFFFFF60", 0, 764-25, "monospace", "25", "left")

window.requestAnimationFrame(update)
}

//updatePrec
function updatePrec() {
if (performance.now() >= timefunc[1] && !timefunc[2]) {timefunc[0](); timefunc[2] = true;}

for (let i = 0; i < bgDensity; i++) {
	if (bgElements.length <= bgDensity) bgElements.push({color: shadeColor(randomColor(), 100), time: performance.now(), x: Math.floor(Math.random() * 1536) + 30})
		else {
			if (764 * (((performance.now() - bgElements[i].time) + (i*-1)*400)/12000) > 764+50) bgElements[i].time = performance.now();
		}
}

let rolltime = false

	let ib = 0;
for (i in rollQueue) {
	i = parseInt(i)
	if (rollQueue[i].type == 7) ib++;
	if (i % 2 == 0 && rollQueue[i+1] != undefined) {
		if ((performance.now() - timeStarted)/1000 >= rollQueue[i].time && (performance.now() - timeStarted)/1000 < rollQueue[i+1].time) {
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

rrq(100);

if (noteQueue[0] != undefined) {
	while ((noteQueue[0].time - noteQueue[0].position()) <= (difficulties.hitwindow[selected.difficulty][2])*-1 && !noteQueue[0].hit) {
		noteQueue[0].hit = true;
		noteQueue.shift()
		currentJudgement = ["不可", "#9000D0"];
		hits[2]++;
		hits[4] = 0;
			switch (clearGauge[1]) {
				case "Beginner":
					clearGauge[0] -= (150 / songNotes)
				break;
				case "Easy":
					clearGauge[0] -= (150 / songNotes)
				break;
				case "Normal":
					clearGauge[0] -= (150 / songNotes)
				break;
				case "Hard":
					clearGauge[0] -= (10/3)
				break;
				case "EXHard":
					clearGauge[0] -= 10
				break;
			}
	}
}

if (hitting != 0) {
	console.log(rolltime)
	if (rolltime) {
		hits[3]++;
		if (balloon.at != 0) {
			if (balloon.hits > 0 && hitting == 1) balloon.hits--;
			else hits[3]--;
		}
		hitting = 0;
		return;
	}
	let typecor = [[1, 3], [2, 4], [1, 3], [2, 4], [1], [1], [1], [1]]
	let precMS = Math.abs(noteQueue[0].time - noteQueue[0].position())
	if (noteQueue[0] != undefined) {
	if (typecor[noteQueue[0].type - 1].includes(hitting) && precMS <= difficulties.hitwindow[selected.difficulty][2]) {
		if(precMS <= difficulties.hitwindow[selected.difficulty][0]) {
			currentJudgement = ["良", "#FFA000"];
			hits[0]++;
			hits[4]++;
			switch (clearGauge[1]) {
				case "Beginner":
					clearGauge[0] += (200 / songNotes)
				break;
				case "Easy":
					clearGauge[0] += (175 / songNotes)
				break;
				case "Normal":
					clearGauge[0] += (150 / songNotes)
				break;
				case "Hard":
					if (clearGauge[0] != 0) clearGauge[0] += 0.075
				break;
				case "EXHard":
					if (clearGauge[0] != 0) clearGauge[0] += 0.05
				break;
			}
		}
		else if(precMS <= difficulties.hitwindow[selected.difficulty][1]) {
			currentJudgement = ["可", "#80FFFF"];
			hits[1]++;
			hits[4]++;
			switch (clearGauge[1]) {
				case "Beginner":
					clearGauge[0] += (100 / songNotes)
				break;
				case "Easy":
					clearGauge[0] += (87.5 / songNotes)
				break;
				case "Normal":
					clearGauge[0] += (75 / songNotes)
				break;
				case "Hard":
					if (clearGauge[0] != 0) clearGauge[0] += 0.0375
				break;
				case "EXHard":
					if (clearGauge[0] != 0) clearGauge[0] += 0.025
				break;
			}
		}
		else {
			currentJudgement = ["不可","#9000D0"];
			hits[2]++;
			hits[4] = 0;
			switch (clearGauge[1]) {
				case "Beginner":
					clearGauge[0] -= (150 / songNotes)
				break;
				case "Easy":
					clearGauge[0] -= (150 / songNotes)
				break;
				case "Normal":
					clearGauge[0] -= (150 / songNotes)
				break;
				case "Hard":
					clearGauge[0] -= (10/3)
				break;
				case "EXHard":
					clearGauge[0] -= 10
				break;
			}
		}
	noteQueue[0].hit = true;
	noteQueue.shift();
	}
	hitting = 0;
	}
}

clearGauge[0] = Math.min(Math.max(clearGauge[0], 0), ((clearGauge[1] == "Hard" || clearGauge[1] == "EXHard") && clearGauge[0] <= 0) ? 0 : 100)

if (hits[4] > hits[5]) hits[5] = hits[4]
}


class note{
	constructor(type, time, bpm, scroll) {
		this.type = type;
		this.time = time;
		this.started = performance.now();
		this.position = () => {return (performance.now() - this.started)/1000};
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

function loadChart(ret=false) {
	let chartData = {
		fullData: songdata[selected.song],
		course: (selected.difficulty != 3 ? selected.difficulty : (difficulties.names[3] == "Extreme" ? 3 : 4)),
		bpm: parseFloat(mdValue("BPM", songdata[selected.song])),
		offset: parseFloat(mdValue("OFFSET", songdata[selected.song]))-(4+0.1+selected.settings.offset/1000),
		courseData: "pending",
		scroll: "pending",
		measure: "pending"
	}
	chartData.courseData = extractCourse(chartData.course, chartData.fullData, true).replaceAll("\n,\n", "\n0,\n")
	clearGauge[1] = difficulties.gauges[selected.difficulty]
	console.log(chartData)
	chartData.scroll = 1
	chartData.measure = 4/4;
	if(ret) return chartData
	let currentBeat = 0
	let currentBPM = chartData.bpm
	let currentMeasure = chartData.measure
	let currentScroll = chartData.scroll
	if (mdValue("BALLOON", extractCourse(chartData.course, chartData.fullData, false)) != "") {
		balloon.hitQueue = JSON.parse(`[${mdValue("BALLOON", extractCourse(chartData.course, chartData.fullData, false))}]`)
	}
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
		console.log(dll)
		dll = dll.join("").split("\n").filter(item => item != "")
		//console.log(dll)
		if (dll.length == 0) dll = ["0"]
		ndl = []
		for (k in dll) {
			if (dll[k].at(0) != "#") ndl.push(dll[k].split(""))
		}
		ndl = singleArray(ndl)
		if (ndl.length == 0) ndl = ["0"]
		console.log(ndl)
		
		for (k = 0; k < dll.length; k++) {
			//console.log(currentBeat)
			if (dll[k].at(0) == "#") {
				let ev = dll[k].split(" ")
				console.log(ev)
				switch (ev[0]) {
				case "#MEASURE":
					currentMeasure = Function("return " + ev[1])();
				break;
				case "#SCROLL":
					currentScroll = parseFloat(ev[1]);
				break;
				case "#BPMCHANGE":
					let pastBPM = currentBPM
					currentBPM = parseFloat(ev[1]);
					currentBeat = currentBeat * (currentBPM/pastBPM)
					console.log(pastBPM, currentBPM, currentBeat)
				break;
				case "#GOGOSTART":
					setTimeout(() => {gogo = true}, ((60/currentBPM*(currentBeat*4))-chartData.offset) * 1000)
				break;
				case "#GOGOEND":
					setTimeout(() => {gogo = false}, ((60/currentBPM*(currentBeat*4))-chartData.offset) * 1000)
				break;
			}
			} else {
				dll[k] = dll[k].split("")
				for (let l = 0; l < dll[k].length; l++) {
					if(dll[k][l] != "0") {
						if(dll[k][l] < 5 || dll[k][l] > 8) noteQueue.push(new note(dll[k][l], (60/currentBPM*(currentBeat*4))-chartData.offset, currentBPM, currentScroll))
						else rollQueue.push(new note(dll[k][l], (60/currentBPM*(currentBeat*4))-chartData.offset, currentBPM, currentScroll))
					}
					console.log((60/currentBPM*(currentBeat*4))-chartData.offset)
					currentBeat += ((1/ndl.length)*currentMeasure)
				}
			}
		}
	}
	songNotes = noteQueue.length;
	rrq(100);
	setTimeout(() => {clearShow = true; setTimeout(() => {fadetomode(1)}, 5000)}, ((60/currentBPM*(currentBeat*4))-chartData.offset)*1000)
}

function betterTimeout(func, ms) {
	if (typeof func != "function") console.warn("the first value needs to be a function")
	else {
		timefunc[0] = func;
		timefunc[1] = performance.now() + ms;
		timefunc[2] = false;
	}
}

Mousetrap.bind('enter', function() {
	if (canSelect) {
		if (mode == 0) fadetomode(1)
		if (mode == 1) {
		switch(selected.selection) {
			case "song":
			selected.difficulty = 0
			selected.selection = "difficulty"
			break;
			
			case "difficulty":
			fadetomode(2);
			break;
			}
		}
	}
});

Mousetrap.bind(controls[0], function() {
	if (canSelect) {
		if (mode == 1) {
			switch(selected.selection) {
			case "song":
			if (selected.song > -1) {
				selected.song--;
				soundManager.stopAll();
				if(selected.song != -1) {
				songaudios[selected.song].setPosition(parseFloat(mdValue("DEMOSTART", songdata[selected.song]))*1000);
				songaudios[selected.song].play();
				}
			}
			break;
			
			case "difficulty":
			if (selected.difficulty > -1) selected.difficulty--
			break;
			}
		}
		if (mode == 2) hitting = 2
	}
})

Mousetrap.bind([controls[1], controls[2]], function() {
	if (canSelect) {
		if (mode == 0) fadetomode(1)
		if (mode == 1) {
		switch(selected.selection) {
			case "song":
			selected.difficulty = 0
			selected.selection = "difficulty"
			break;
			
			case "difficulty":
			if(selected.difficulty > -1)fadetomode(2);
			else {
				selected.selection = "song"; 
				selected.difficulty = -2;
				if (uracounter % 20 >= 10) {
				let a = [difficulties.names[3], difficulties.colors[3]];
				difficulties.names[3] = difficulties.names[4];
				difficulties.names[4] = a[0];
				difficulties.colors[3] = difficulties.colors[4];
				difficulties.colors[4] = a[1];
				}
				uracounter = 0
				}
			break;
			}
		}
		if (mode == 2) hitting = 1
	}
})

Mousetrap.bind(controls[3], function() {
	if (canSelect) {
		if (mode == 1) {
			switch(selected.selection) {
			case "song":
			if (selected.song < songdata.length-1) {
				selected.song++;
				soundManager.stopAll();
				songaudios[selected.song].setPosition(parseFloat(mdValue("DEMOSTART", songdata[selected.song]))*1000);
				songaudios[selected.song].play();
			}
			break;
			
			case "difficulty":
			if (selected.difficulty < 3) selected.difficulty++
			else {
			if (hasCourse("4", songdata[selected.song])) uracounter++
			if (uracounter % 20 == 10 || uracounter % 20 == 0 && hasCourse("4", songdata[selected.song])) {
				let a = [difficulties.names[3], difficulties.colors[3]];
				difficulties.names[3] = difficulties.names[4];
				difficulties.names[4] = a[0];
				difficulties.colors[3] = difficulties.colors[4];
				difficulties.colors[4] = a[1];
			}
			}
			break;
			}
		}
		if (mode == 2) hitting = 2
	}
})

Mousetrap.bind("w", function() {
	let co = prompt("chart offset (ms)");
	selected.settings.offset = co
})

Mousetrap.bind("=", function() {
	clearGauge = [clearGauge[0] == 0 ? 100 : clearGauge[0], clearGauge[1] == "Hard" ? "EXHard" : "Hard"]
})

Mousetrap.bind("0", function() {
	soundManager.setVolume(3);
})

setInterval(updatePrec, 1)
setInterval(() => {tipnum = Math.floor(Math.random() * tips.length)}, 12500)

setTimeout(() => {
	for (i in songdata) {
		songdata[i] = songdata[i].replaceAll("Dan", "6").replaceAll("Edit", "4").replaceAll("Oni", "3").replaceAll("Hard", "2").replaceAll("Normal", "1").replaceAll("Easy", "0")
	}
}, 100)

let activation = setInterval(() => {
if (navigator.userActivation.isActive) {
	mode = 0;
	selected.song = Math.floor(Math.random() * songdata.length)
	setTimeout(() => {soundManager.setVolume(selected.settings.volume); songaudios[selected.song].play()}, 500)
	setTimeout(() => {window.requestAnimationFrame(update)}, 500);
	clearInterval(activation);
}
}, 1)

