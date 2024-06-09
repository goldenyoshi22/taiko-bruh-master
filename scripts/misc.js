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
"warning: this game is stupid",

//actual tips
"keyboard and drum play are different in some ways,\nespecially as difficulty increases.",
"if you're getting confused on streams, you could practice handswitching.",
"try practicing your accuracy, it will pay off later on.",
"make sure you have a good drum for high level play!\nyou can't play 11+ with a tatacon...right?",
"if you can't beat anything too hard, don't give up!\nkeep playing the game to improve.",
"each difficulty has a different scale.\nextreme ☆3 will be way harder than easy ☆3.",
"if you feel like taking a break, don't hesitate.\nthis is just a game, after all...",
"if you're having trouble with your accuracy,\nmaybe your offset isn't right.",
"some songs have an extra difficulty, which is accessible by pressing\nright ka 10 times when selecting extreme."
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

function nthIndexOf(string, pattern, n) {
    var i = -1;

    while (n-- && i++ < string.length) {
        i = string.indexOf(pattern, i);
        if (i < 0) break;
    }

    return i;
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function lineOf(strg, need, num=1) {
	let index = nthIndexOf(strg, need, num);
	if (index == -1) return 0;
	let piece = strg.substring(0, index);
	return piece.split('\n').length;
}

function mdValue(metadata, chart, num = 1, arra = false, log = false) {
  const lines = chart.split("\n");
  const regexF = RegExp(metadata, "gm");

  if (!arra) {
    const lineIndex = lineOf(chart, metadata, num);
    if (lineIndex <= 0 || chart.search(regexF) < num) {
      if (log) console.log(`No ${metadata} found.`);
      return "";
    }
    const line = lines[lineIndex - 1];
    const regexSeparator = line.includes(":") ? ":" : " ";
	let splitLine = line.split(regexSeparator)
	for (let i = 2; i < splitLine.length; i++) {
		splitLine[1] = splitLine[1] + regexSeparator + splitLine[i];
	}
    return splitLine[1].replace(/\n/g, "");
  }

  const result = [];
  let i = 1;
  let current;
  while ((current = mdValue(metadata, chart, i++))) {
    const lineIndex = lineOf(chart, metadata, i - 1);
    if (lineIndex <= 0 || chart.search(regexF) < i - 1) {
      if (log) console.log(`No ${metadata} found.`);
      break;
    }
    const line = lines[lineIndex - 1];
    const regexSeparator = line.includes(":") ? ":" : " ";
    result.push(line.split(regexSeparator)[1].replace(/\n/g, ""));
  }

  return result.sort((a, b) => parseFloat(a) - parseFloat(b));
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

function convertToUTF8(str) {
  const utf8Encoder = new TextEncoder();
  const utf8Array = utf8Encoder.encode(str);
  return Array.from(utf8Array, byte => String.fromCharCode(byte)).join('');
}

function msCheck(func) {
	console.time("prof")
	func();
	console.timeEnd("prof")
}

function performanceTester(seconds) {
	let pt = performance.now();
	let perf = 0;
	while (performance.now() < (pt+seconds*1000)) {
		perf++;
	}
	return perf
}

let weightedAverage = (nums, weights) => {
  let [sum, weightSum] = weights.reduce(
    (acc, w, i) => {
      acc[0] = acc[0] + nums[i] * w;
      acc[1] = acc[1] + w;
      return acc;
    },
    [0, 0]
  );
  return sum / weightSum;
};