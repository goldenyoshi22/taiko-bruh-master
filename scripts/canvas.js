let cid = "gameCanvas";
let scale = [1, 1]
var mod = "none"

//EZCanvas
/*
rect(color, x, y, width, height) - draws a rectangle of [width]x[height] dimensions at ([x], [y]), with the color of [color]
clear() - clears the canvas
text(text, color, x, y, font, size, align, stroke) - draws "[text]" with a [size]px [font] font at ([x], [y]), aligned to the [align]. [stroke] determines whether it's an outlined text instead of a filled one
autosize() - automatically resizes the canvas based on the window size
image()
*/
var cv = {
scale: (w=1, h=1) => {
	var canvas = document.getElementById(cid);
	var ctx = canvas.getContext("2d");
	ctx.setTransform(scale[0], 0, 0, scale[1], 0, 0)
	ctx.clearRect(0, 0, 1536, 764);
	ctx.setTransform(1/scale[0], 0, 0, 1/scale[1], 0, 0)
	scale = [w, h]
},

rect: (color="#FFFFFF", x=0, y=0, width=50, height=50, stroke=false, shadow=[0, color]) => {
if (mod == "invert") {
	let h;
	if (typeof color == "object") {
		h = [];
		for (let i = 0; i < color.length; i++) {
			h.push(color[i].substr(7, 2))
			let inverting = parseInt(color[i].substr(1, 6), 16);
			color[i] = "#" + ((inverting & 0x000000) | (~inverting & 0xFFFFFF)).toString(16).padStart(6, "0") + h[i];
		}
	} else {
		h = color.substr(7, 2)
		let inverting = parseInt(color.substr(1, 6), 16);
		color = "#" + ((inverting & 0x000000) | (~inverting & 0xFFFFFF)).toString(16).padStart(6, "0") + h;
	}
	shadow[1] = color;
}

var canvas = document.getElementById(cid);
var ctx = canvas.getContext("2d");
ctx.setTransform(scale[0], 0, 0, scale[1], 0, 0)
if (typeof color == "string") ctx.fillStyle = color;
else if (typeof color == "object") {
 var gradi = ctx.createLinearGradient(x, y, x+width, y+height);
 for (var i = 0; i < color.length; i++) {
      gradi.addColorStop(i / (color.length-1), color[i]);
}
 ctx.fillStyle = gradi;
}
if(color.length>7) ctx.globalAlpha = Number("0x" + color.split(7)[1]);
ctx.shadowBlur = shadow[0];
ctx.shadowColor = shadow[1];
if (stroke) {
	ctx.lineWidth = stroke;
	ctx.strokeRect(x, y, width, height);
} else ctx.fillRect(x, y, width, height);
ctx.globalAlpha = 1;
ctx.shadowBlur = 0;
ctx.shadowColor = "black";
ctx.setTransform(1/scale[0], 0, 0, 1/scale[1], 0, 0)
},



circ: (color="#FFFFFF", x=0, y=0, radius=50, stroke=false, shadow=[0, color]) => {
if (mod == "invert") {
	let h;
	if (typeof color == "object") {
		h = [];
		for (let i = 0; i < color.length; i++) {
			h.push(color[i].substr(7, 2))
			let inverting = parseInt(color[i].substr(1, 6), 16);
			color[i] = "#" + ((inverting & 0x000000) | (~inverting & 0xFFFFFF)).toString(16).padStart(6, "0") + h[i];
		}
	} else {
		h = color.substr(7, 2)
		let inverting = parseInt(color.substr(1, 6), 16);
		color = "#" + ((inverting & 0x000000) | (~inverting & 0xFFFFFF)).toString(16).padStart(6, "0") + h;
	}
	shadow[1] = color;
}

var canvas = document.getElementById(cid);
var ctx = canvas.getContext("2d");
ctx.setTransform(scale[0], 0, 0, scale[1], 0, 0)
if (typeof color == "string") ctx.fillStyle = color;
else if (typeof color == "object") {
 var gradi = ctx.createLinearGradient(x, y, x+width, y+height);
 for (var i = 0; i < color.length; i++) {
      gradi.addColorStop(i / (color.length-1), color[i]);
}
 ctx.fillStyle = gradi;
}
if(color.length>7) ctx.globalAlpha = Number("0x" + color.split(7)[1]);
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  ctx.shadowBlur = shadow[0];
  ctx.shadowColor = shadow[1];
if (stroke) {
	ctx.lineWidth = stroke;
	ctx.strokeStyle = ctx.fillStyle;
	ctx.stroke();
}
else ctx.fill();
ctx.globalAlpha = 1;
ctx.shadowBlur = 0;
ctx.shadowColor = "black";
ctx.setTransform(1/scale[0], 0, 0, 1/scale[1], 0, 0)
},



clear: () => {
var canvas = document.getElementById(cid);
var ctx = canvas.getContext("2d");
ctx.setTransform(scale[0], 0, 0, scale[1], 0, 0)
ctx.clearRect(0, 0, 1536, 764);
ctx.setTransform(1/scale[0], 0, 0, 1/scale[1], 0, 0)
},



text: (text="sample :P", color="#FFDDFF", x=0, y=0, font="monospace", size="20", align="center", stroke=false, shadow=[0, color]) => {
if (mod == "invert") {
	let h;
	if (typeof color == "object") {
		h = [];
		for (let i = 0; i < color.length; i++) {
			h.push(color[i].substr(7, 2))
			let inverting = parseInt(color[i].substr(1, 6), 16);
			color[i] = "#" + ((inverting & 0x000000) | (~inverting & 0xFFFFFF)).toString(16).padStart(6, "0") + h[i];
		}
	} else {
		h = color.substr(7, 2)
		let inverting = parseInt(color.substr(1, 6), 16);
		color = "#" + ((inverting & 0x000000) | (~inverting & 0xFFFFFF)).toString(16).padStart(6, "0") + h;
	}
	shadow[1] = color;
}

var canvas = document.getElementById(cid);
var ctx = canvas.getContext("2d");
ctx.setTransform(scale[0], 0, 0, scale[1], 0, 0)
ctx.font = size + "px " + font;
if (typeof color == "string") ctx.fillStyle = color;
else if (typeof color == "object") {
 var gradi = ctx.createLinearGradient(x-(size*text.length*0.5), y-(size*0.5), x+(size*text.length*0.5), y+(size*0.5));
 for (var i = 0; i < color.length; i++) {
      gradi.addColorStop(i / (color.length-1), color[i]);
 }
 ctx.fillStyle = gradi;
}
ctx.textAlign = align;
if(color.length>7 && color.includes("#") && typeof color == "string") ctx.globalAlpha = Number("0x" + color.split(7)[1]);

if (typeof text == "number") text = text.toString();
if (text.includes("\n")) text = text.split("\n")
if (typeof text != "object") text = [text]
for (t = 0; t < text.length; t++) {
if(!stroke) {ctx.fillText(text[t], x, y+t*parseFloat(size));}
else {ctx.strokeText(text[t], x, y+t*parseFloat(size));}
ctx.shadowBlur = shadow[0];
ctx.shadowColor = shadow[1];
if(!stroke) {ctx.fillText(text[t], x, y+t*parseFloat(size));}
else {ctx.strokeText(text[t], x, y+t*parseFloat(size));}
}

ctx.globalAlpha = 1;
ctx.shadowBlur = 0;
ctx.shadowColor = "black";
ctx.setTransform(1/scale[0], 0, 0, 1/scale[1], 0, 0)
},

autosize: () => {
var canvas = document.getElementById(cid);

var heightOriginal = canvas.height;
var widthOriginal = canvas.width;
var heightNew = window.innerHeight;
var widthNew = heightNew / heightOriginal * widthOriginal;

canvas.style.height = `${heightNew}px`
canvas.style.width = `${widthNew}px`
},

image: (imgs, x=0, y=0, width=50, height=50) => {
let canvas = document.getElementById(cid);
let ctx = canvas.getContext("2d");
ctx.setTransform(scale[0], 0, 0, scale[1], 0, 0)
let img = new Image();
img.onload = function() {
ctx.drawImage(img, x, y, width, height);
};
img.src = imgs;
ctx.setTransform(1/scale[0], 0, 0, 1/scale[1], 0, 0)
}
};
