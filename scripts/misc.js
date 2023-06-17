var tips = [
//short messages
"welcome!",
"ready to drum?",
"ready to smash your keyboard?",
`good ${new Date().getHours() < 6 || new Date().getHours() > 18 ? "evening" : (new Date().getHours() < 12 ? "morning" : "afternoon")}!`,

//jokes or misc
"credit to goldenyoshi22 for naming the game",
"bruh",
"warning: foon is rising.\nbetter run soon (^^)",
"shoutout to renos",
"embrace the power of multitasking!",
"分かりますか?",
"not sponsored by 太鼓のオワタツジン",

//actual tips
"keyboard and drum play are different in some ways,\nespecially as difficulty increases.",
"if you're getting confused on streams, you could practice handswitching.",
"try practicing your accuracy, it will pay off later on.",
"make sure you have a good drum for high level play!\nyou can't play 11+ with a tatacon...right?",
"if you can't beat anything too hard, don't give up!\nkeep playing the game to improve.",
"each difficulty has a different scale.\nextreme ☆3 will be way harder than easy ☆3."
]


function ID(n) {
return document.getElementById(n)
}

function shadeColor(color, percent) {

	let rgb = [0, 0, 0]
	
	for (j = 0; j < 3; j++) {
		rgb[j] = (parseInt(color.substring(j*2 + 1, j*2 + 3),16))
		rgb[j] = Math.round((rgb[j] * (100+percent))/100)
		rgb[j] = Math.max(Math.min(rgb[j], 255), 0)
		rgb[j] = (rgb[j].toString(16).length==1) ? "0" + rgb[j].toString(16) : rgb[j].toString(16)
	}

    return "#"+rgb[0]+rgb[1]+rgb[2];
}

function numtobase(num, base) {
	return num.toString(base)
}

function lineOf(strg, need) {
	let index = strg.indexOf(need);
	let piece = strg.substring(0, index);
	return piece.split('\n').length;
}

function mdValue(metadata, chart) {
	if (chart.search(RegExp(`${metadata}`, "gm")) == -1) {console.log(`No ${metadata} found.`); return "";}
	else return chart.split("\n")[lineOf(chart, metadata) - 1].split(chart.split("\n")[lineOf(chart, metadata) - 1].includes(":") ? ":" : " ")[1].replace(/\n/g, "")
}

function extractCourse(course, chart, trimToStart=false) {
	let loc = chart.indexOf(`COURSE:${course}`)
	let r1 = chart.split("").slice(loc).join("")
	return (trimToStart ? r1.split("").slice(r1.indexOf("#START")+6, r1.indexOf("#END")).join("") : r1.split("").slice(0, r1.indexOf("#END")).join(""))
}

function hasCourse(course, chart) {
	return extractCourse(course, chart).length > 0
}

function singleArray(arr) {
	return arr.reduce((accum, item) => {
    accum = [...accum, ...item];
    return accum;
}, []);
}

function randomColor() {
	return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
}

function numberToColor(num) {
	return `#${Math.floor(num).toString(16).padStart(6, '0')}`
}

function lengthOfTime(ms) {
let min = Math.floor(ms / 60000)
let sec = Math.floor(ms / 1000) % 60
let mss = Math.round((ms % 1000)) / 1000
return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${mss.toString().slice(2, mss.length).padStart(3, "0")}`
}