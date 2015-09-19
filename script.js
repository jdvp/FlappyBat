/* Author : JD Porterfield */

var bat;
var dimension;
var y;
var batImg = ["url(\"img/bat1.png\")","url(\"img/bat3.png\")","url(\"img/bat2.png\")"];
var resSizes = {"batWidth" : 177, "batHeight" : 134, "backgroundWidth" : 1080, "backgroundHeight" : 1920, "readyWidth" : 540, "readyHeight" : 550, "pipeWidth" : 180};
var difficulty;
var movement;

var batHeight;
var pipes = [];
var pipeCounter;
var score;
var scoreDisplay;
var endCard;

var myInterval;
var pipeInterval;
var stepsLeft;


function determineSizes(){
	
	dimension = {};
	difficulty = {};
	movement = {};
	movement["verticalSpeed"] = 0;
	difficulty["pipeDistance"] = 60;
	pipeCounter = 0;
	score = 0;
	stepsLeft = 0;
	myInterval = null;
	pipeInterval = null;
	
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	dimension["viewHeight"] = h;
	dimension["viewWidth"] = w;
	
	//background
	var b = document.getElementById("background");
	b.style.height = h + "px";
	var width = (h * (resSizes["backgroundWidth"]/resSizes["backgroundHeight"]));
	dimension["backw"] = width;
	
	//bat
	bat = document.getElementById("bat");
	batHeight = (h * (resSizes["batHeight"]/resSizes["backgroundHeight"]));
	bat.style.height =  batHeight + "px";
	var batWidth = (width * (resSizes["batWidth"]/resSizes["backgroundWidth"]));
	dimension["batWidth"] = batWidth;
	bat.style.width = batWidth + "px";
	bat.style.top = (h/2) - (batHeight/2) + "px";
	bat.style.left = (w/2) - (batWidth/2) +"px";
	dimension["batHeight"] = batHeight;
	y = (h/2) - (batHeight/2);
	
	//ready graphic
	var s = document.getElementById("startGraphic");
	var swidth = (width * (resSizes["readyWidth"]/resSizes["backgroundWidth"]));
	s.style.width = swidth + "px";
	var sheight = (h * (resSizes["readyHeight"]/resSizes["backgroundHeight"]));
	s.style.height = sheight + "px";
	s.style.left = (w / 2 - swidth / 2) + "px";
	
	//pipe
	dimension["pipeWidth"] = (width * resSizes["pipeWidth"] / resSizes["backgroundWidth"]);
	dimension["pipemovespeed"] = (width * 12 / resSizes["backgroundWidth"]);
	difficulty["pipeGap"] = (h * 600 / resSizes["backgroundHeight"]);
	difficulty["pipeVerticalDistance"] = (h * 400 / resSizes["backgroundHeight"]);
	difficulty["minPipeGap"] = (h * (resSizes["batHeight"] + 50) / resSizes["backgroundHeight"]);
	difficulty["pipeGapRate"] = (h * 25 / resSizes["backgroundHeight"]);
	dimension["pipeCenter"] = (h / 2);
	
	//scale the jump speed and acceleration accordingly for the size of the canvas
	movement["jumpSpeed"] = (h * (-30 / resSizes["backgroundHeight"]));
	movement["fallAcceleration"] = (h * (2 / resSizes["backgroundHeight"]));
	
	//scale the end card
	endCard = document.getElementById("endCard");
	endCard.style.width = (width * 360 / resSizes["backgroundWidth"]) + "px";
	endCard.style.height = (h * 640 / resSizes["backgroundHeight"]) + "px";
	endCard.style.left = (w - (width * 360 / resSizes["backgroundWidth"])) / 2 + "px";
	endCard.style.top = (h - (h * 640 / resSizes["backgroundHeight"])) / 2 + "px";
	
	//scale the fonts
	var smallFontItems = document.getElementsByClassName("smallFont");
	for(var i = 0; i < smallFontItems.length; i++){
		smallFontItems[i].style.fontSize = (h * 50 / resSizes["backgroundHeight"]) + "px";
	}
	var largeFontItems = document.getElementsByClassName("largeFont");
	for(var i = 0; i < largeFontItems.length; i++){
		largeFontItems[i].style.fontSize = (h * 150 / resSizes["backgroundHeight"]) + "px";
	}
}

function increaseDifficulty(){
	if(difficulty["pipeGap"] > difficulty["minPipeGap"]){
		difficulty["pipeGap"] -= difficulty["pipeGapRate"];
	}
	
	if(difficulty["pipeDistance"] > 10){
		difficulty["pipeDistance"] -= 1;
	}
}

function flapWings(){
	bat.style.backgroundImage = batImg[0];
	setTimeout(function(){
		bat.style.backgroundImage = batImg[1];
		setTimeout(function(){
			bat.style.backgroundImage = batImg[2];
		}, 100);
	}, 100);
	movement["verticalSpeed"] = movement["jumpSpeed"];
	fall();
}

function loseGame(){
	clearInterval(myInterval);
	clearInterval(pipeInterval);
	document.getElementById("endScore").innerHTML = score;
	var hScore = localStorage.getItem("highScore");
	if(score > hScore){
		localStorage.setItem("highScore", score);
	}
	document.getElementById("highScore").innerHTML = localStorage.getItem("highScore");
	endCard.style.visibility = "initial";
	scoreDisplay.style.visibility = "hidden";
	bat.style.visibility = "hidden";
	for(var i = 0; i < pipes.length; i++){
		var t = document.getElementById(pipes[i]["name"] + "top");
		var b = document.getElementById(pipes[i]["name"] + "bottom")
		t.parentNode.removeChild(t);
		b.parentNode.removeChild(b);
	}
	pipes = [];
	determineSizes();
	document.onclick = null;
	setTimeout(function(){document.onclick = restart}, 1000);
}

function fall(){
	movement["verticalSpeed"] += movement["fallAcceleration"];
	y += movement["verticalSpeed"];
	bat.style.top = y + "px";
	
	if( y < 0 || y + batHeight > dimension["viewHeight"]){
		loseGame();
	}
	checkCollisions();
}

function checkCollisions(){
	
	//floor and ceiling
	if( y < 0 || y + batHeight > dimension["viewHeight"]){
		loseGame();
	}
	
	//the pipe obstacles
	for(var i = 0; i < pipes.length; i++){		
		 
		if(checkDivCollisionWithBat(i)){
			loseGame();
		}
	}
}

function checkDivCollisionWithBat(div){
	
	//I create elements a, b, and c so that the checking expressions will be easier to understand
	var a = {"left" : dimension["viewWidth"]/2 - dimension["batWidth"]/2 , "top" : y, "bottom" : y + dimension["batHeight"]};
	a["right"] = a["left"] + dimension["batWidth"];

	var b = {"left" : pipes[div]["left"], "right" : pipes[div]["left"] + dimension["pipeWidth"], "top" : 0, "bottom" : pipes[div]["height"]};
	var c = {"left" : pipes[div]["left"], "right" : pipes[div]["left"] + dimension["pipeWidth"], "top": pipes[div]["bottomtop"], "bottom": dimension["viewHeight"]};
	
	return checkGenericCollision(a, b) || checkGenericCollision(a, c);
}

function checkGenericCollision(a, b){
	
	//right corners
	if(a.right > b.left && a.right < b.right){
		
		//top right
		if(a.top < b.bottom && a.top > b.top){
			return true;
		}
		
		//bottom right
		if(a.bottom > b.top && a.bottom < b.bottom){
			return true;
		}
	}
	
	//left corners
	if(a.left > b.left && a.left < b.right){
		
		if(a.top > b.top && a.top < b.bottom){
			return true;
		}
		
		if(a.bottom > b.top && a.bottom < b.bottom){
			return true;
		}
	}
	
	return false;
}

function changePipePosition(){
	
	var neg = Math.random() > .5;
	var offTop = (dimension["pipeCenter"] - (difficulty["pipeGap"] / 2)) <= dimension["viewHeight"] * .02  ? true : false;
	var offBot = (dimension["pipeCenter"] + (difficulty["pipeGap"] / 2)) >= dimension["viewHeight"] * .98  ? true : false;
	var multiplier = neg ? -1 : 1;
	if(offTop){
		multiplier = 1;
	} else if (offBot){
		multiplier = -1;
	}
	var distance = difficulty["pipeVerticalDistance"] * Math.random();
	dimension["pipeCenter"] += (multiplier * distance);
	if((dimension["pipeCenter"] - (difficulty["pipeGap"] / 2)) < dimension["viewHeight"] * .02){
		dimension["pipeCenter"] = (dimension["viewHeight"] * .02) + (difficulty["pipeGap"] / 2);
	} else if ((dimension["pipeCenter"] + (difficulty["pipeGap"] / 2)) > dimension["viewHeight"] * .98){
		dimension["pipeCenter"] = (dimension["viewHeight"] * .98) - (difficulty["pipeGap"] / 2);
	}
}

function movePipes(){
	
	if(stepsLeft == 0){
		var back = document.getElementById("pipeContainer");
		var left = "100%";
		var name = "pipe" + pipeCounter;
		pipeCounter = (pipeCounter + 1) % 100;
		var thisPipe = {"left" : dimension["viewWidth"], "name" : name, "passed" : false};
		pipes.push(thisPipe);
		back.innerHTML = back.innerHTML + "	<div id=\""+name+"top\" class=\"pipe\"></div><div id=\""+name+"bottom\" class=\"pipe\"></div>";
		var pipe = document.getElementById(name+"top");
		
		
		pipe.style.width = dimension["pipeWidth"] + "px";
		thisPipe["height"] = dimension["pipeCenter"] - (difficulty["pipeGap"] / 2) 
		pipe.style.height = thisPipe["height"] + "px";
		pipe.style.left = left + "px";
		pipe.style.top = "0%";
		
		pipe = document.getElementById(name+"bottom");
		
		pipe.style.width = dimension["pipeWidth"] + "px";
		pipe.style.height = dimension["viewHeight"] - (dimension["pipeCenter"] + (difficulty["pipeGap"] / 2)) + "px";
		pipe.style.left = left + "px";
		thisPipe["bottomtop"] = dimension["pipeCenter"] + (difficulty["pipeGap"] / 2);
		pipe.style.top =  thisPipe["bottomtop"]+ "px";
		
		changePipePosition();
		
		stepsLeft = difficulty["pipeDistance"];
	}
	for(var i = 0; i < pipes.length; i++){
		
		var t = document.getElementById(pipes[i]["name"] + "top");
		var b = document.getElementById(pipes[i]["name"] + "bottom");
		pipes[i]["left"] -= dimension["pipemovespeed"];
		t.style.left = pipes[i]["left"] + "px";
		b.style.left = pipes[i]["left"] + "px";
		
		
		if(pipes[i]["left"] < (0 - dimension["pipeWidth"] )){
			pipes.splice(i, 1);
			t.parentNode.removeChild(t);
			b.parentNode.removeChild(b);
		}
		
		else if((pipes[i]["left"] + dimension["pipeWidth"] < (dimension["viewWidth"]/2) - (dimension["batWidth"]/2))  && pipes[i]["passed"] == false){
			pipes[i]["passed"] = true;
			score += 1;
			scoreDisplay.innerHTML = score;
			if(score % 5  == 0){
				increaseDifficulty();
			}
		}
	}
	stepsLeft -= 1;
}

function start(){
	document.getElementById("startGraphic").style.visibility = "hidden";
	scoreDisplay = document.getElementById("score");
	scoreDisplay.style.visibility = "initial";
	scoreDisplay.innerHTML = "0";	
	document.oncontextmenu = function(){flapWings(); return false;}
	pipeInterval = setInterval(movePipes, 33);
	myInterval = setInterval(fall, 33);
	document.onclick = flapWings;
}

function restart(){
	document.getElementById("startGraphic").style.visibility = "initial";
	bat.style.visibility = "initial";
	endCard.style.visibility = "hidden";
	document.onclick = start;
}

document.addEventListener('DOMContentLoaded', function () {
	determineSizes();
	document.onclick = start;
	document.ondragstart = function() { return false; };
	document.onselectstart = function(){ return false; };
});