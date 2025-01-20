let bpm = 240;
let breaktime = 0;
let songlength = 0;
let chart = [
	[1, 0],
	[2, 0.125],
	[1, 0.25],
	[2, 0.375],
	[1, 0.5],
	[2, 4/6],
	[2, 5/6],
	[1, 1]
];

function noteDataToChart(a) {
	chart = [];
	bpm = mdValue("BPM", starSongWanted[0] != undefined ? songdata[starSongWanted[0]] : songdata[selected.song])
	bpm *= (2 ** (selected.mods.songSpeed/12))
	songlength = (a[a.length - 1].time) - 4;
	//console.log(songlength);
	for (let i = 0; i < a.length; i++) {
		if (["1", "2", "3", "4"].includes(a[i].type)) {
			chart.push([a[i].type, (a[i].time - 4) / (60 / bpm)])
			chart[i][1] = Math.round(chart[i][1] * 20160) / 20160
		}
	}
}

let star = 0;
let nps = 0;




function starRating(c, full=false) {
	//Compile the chart
	if(typeof c == "object" && c[0] != undefined) {
	noteDataToChart(c);
	for (let i = 0; i < chart.length; i++) {
		if (chart[0] >= 3) chart[0] -= 2;
	}
	}
	
	if (c[0] == undefined) chart = [[1, 0], [1, 1]];
	//console.log(chart);
	let bpmRatio = bpm / 120;
	//let bpmRatio = 1;
	nps = chart.length / chart[chart.length - 1][1]
	
	
	
	//Strain: Depends on stamina factors
	//Speed: Depends on how fast notes are (tech may scuff this)
	let strain = 0;
	let speed = 0;
	
	let strainNotes = [];
	let speedNotes = [];
	let newNotes = [];
	
	for (let i = 0; i < chart.length; i++) {
		let noteInterval = (chart[Math.min(i+1, chart.length - 1)][1] - chart[i][1]) / bpmRatio;
		let newNote = (chart[Math.min(i+1, chart.length - 1)][0] == chart[i][0]);
		if (noteInterval > 0) {
			speedNotes.push(1 / noteInterval);
			strainNotes.push(0.2 / noteInterval);
		}
		newNotes.push(newNote);
	}
	
	//Goal estimate, these values are just examples and are probably wack
	//180bpm: 9.8 speed
	//200bpm: 10.2 speed
	//220bpm: 10.6 speed
	//240bpm: 10.9 speed
	//260bpm: 11.2 speed
	//280bpm: 11.6 speed
	//300bpm: 12 speed
	//400bpm: 13 speed
	
	let speedDiffs = [];
	for (let i = 0; i < speedNotes.length; i++) {
		speedDiffs.push(((speedNotes[i]*2.5)**0.65))
	}
	
	let strainDiffs = [];
	for (let i = 0; i < strainNotes.length; i++) {
		strain += ((strainNotes[i] - strain)/10);
		strainDiffs.push(newNotes[i] ? strain*1.03 : strain);
	}
	//speedDiffs = speedDiffs.sort((a, b) => {return a - b});
	
	strain = strainDiffs.reduce((a, b) => a + b) / strainDiffs.length;
	speed = speedDiffs.reduce((a, b) => a + b) / speedDiffs.length;
	
	star = speed + strain;
	//star *= (Math.min(chart.length / 500, 0.5)*2)**0.1
	//console.log(`Strain: ${strain}\nSpeed: ${speed}\n\nstrainNotes: ${strainNotes.toString()}\nspeedNotes: ${speedNotes.toString()}\nTotal: ${star}`)
	//console.log(strainDiffs);
	//console.log(speedDiffs);
	//console.log(`Strain: ${strain}\nSpeed: ${speed}\nTotal: ${star}`);
	return c[0] != undefined ? star : 0;
}


//a.2.0-1       This crap did not work I dont even know what this does anymore.
//This was supposed to be focused on patterns but it didn't really go well regarding strain time
function starRatingOld(c, full=false) {
	if(typeof c == "object" && c[0] != undefined) {
	noteDataToChart(c);
	for (let i = 0; i < chart.length; i++) {
		if (chart[0] >= 3) chart[0] -= 2;
	}
	console.log(chart);
	let bpmRatio = bpm / 120;
	breaktime = 0;
	//let bpmRatio = 1;
	nps = chart.length / chart[chart.length - 1][1]
	patterns = [];
	patternPot = "";
	patternNPS = 0;
	for (let i = 0; i < chart.length; i++) {
		////console.log(Math.round((chart[i][1] - chart[Math.max(i-1, 0)][1])*1000)/1000, Math.round((chart[Math.min(i+1, chart.length - 1)][1] - chart[i][1])*1000)/1000)
		if (Math.round((chart[i][1] - chart[Math.max(i-1, 0)][1])*1000)/1000 == Math.round((chart[Math.min(i+1, chart.length - 1)][1] - chart[i][1])*1000)/1000) {
			patternNPS = 1 / (chart[i][1] - chart[Math.max(i-1, 0)][1]);
			patternPot += chart[i][0];
		} else {
			if (patternPot != "" && patternNPS > 0) {
				patternPot += chart[i][0];
				patterns.push([patternPot, Math.round(patternNPS*1000)/1000])
				patternPot = chart[Math.min(i+1, chart.length - 1)][0];
				patternNPS = 0;
				let chb = (chart[Math.min(i+1, chart.length - 1)][1] - chart[i][1]) / bpmRatio
				if (chb >= 1/bpmRatio) breaktime += Math.min((chb ** 0.6), 6/bpmRatio)
				else breaktime += Math.abs((chb ** 0.2)-1)
			}
		}
	}
	console.log(breaktime)
	breaktime = (breaktime / songlength) / (2 ** (selected.mods.songSpeed / 12));
	breaktime = Math.min(Math.max(breaktime, 0), 1)
	console.log(breaktime)
	if (patternPot != "" && patternNPS > 0) {
		patterns.push[patternPot, Math.round(patternNPS*1000)/1000]
		patternPot = "";
		patternNPS = 0;
	}
	for (let i = 0; i < patterns.length; i++) {
		patterns[i][1] = Math.round(patterns[i][1]*bpmRatio*1000)/1000
	}
	star = patterns;

	let patternDivCUR = [""];
	let patternDiversity = 0;
	for (let i = 0; i < patterns.length; i++) {
		let meets = false;
		for (let j = 0; j < patternDivCUR.length; j++) {
			if (patternDivCUR[j] == patterns[i][0]) {
				meets = true;
			}
		}
	if (!meets) {
		patternDivCUR.push(patterns[i][0]);
		patternDiversity += (((patterns[i][0].length ** 0.10) * (patterns[i][1] ** 0.9)) * 0.5) * (0.75 - Math.abs(((patterns[i][0].match(/1/g)||[]).length / patterns[i][0].length) - 0.5));
	} else patternDiversity /= 1.005
	}
	console.log(patternDivCUR, patternDiversity)
	//let counts = {};
	//patterns.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });

	//console.log(patterns);

	let difficultyArray = [];
	for (let i = 0; i < patterns.length; i++) {
		//(x*1.88) ** (x ** -0.1337)
		difficultyArray.push(((patterns[i][0].length ** 0.10) * ((1.0001 - breaktime) ** 0.15)) * ((10 * patterns[i][1]) ** 0.48))
	}
	difficultyArray = difficultyArray.sort((a, b) => {return a - b});
	console.log(difficultyArray);
	let diffMax = 0;
	let diffAdded = 0;
	/*for (let i = 0; i < difficultyArray.length; i++) {
		if (diffMax < difficultyArray[i]) diffMax = difficultyArray[i];
	}*/
	let spikeFactor = ~~((0.5 * chart.length) ** 0.518)
	difficultyArray.slice(Math.max(difficultyArray.length - spikeFactor, 1)).forEach((a) => {diffMax += a});
	diffMax /= Math.min(spikeFactor, difficultyArray.length);
	//diffMax = (diffMax[0] + diffMax[1] + diffMax[2] + diffMax[3] + diffMax[4]) / 5
	//diffMax = difficultyArray[difficultyArray.length - 1]
	let diffWeight = [];
	for (let i = 0; i < difficultyArray.length; i++) {
		diffWeight.push(Math.min(Math.max((1 - Math.min(Math.abs(1 - difficultyArray[i] / diffMax), 2)) ** 1.13, 0.1), 1.35));
	}
	console.log(diffWeight)
	stars = weightedAverage(difficultyArray, diffWeight)
	//console.log(stars)
	if (!full) return ((stars * ((chart.length/1000) ** 0.2)) * (patternDiversity**0.03)) ** 1;
	else return `Stamina:`
	} else return 0;
}

//setInterval(()=>{report(`☆${starRating(noteQueue).toFixed(2)}`, 2)}, 2500)