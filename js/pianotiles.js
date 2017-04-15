var mode = ['classic', 'arcade', 'bomb'];
var currMode = 0;

var song = "elise";

var started = false;

var timer;
var scrolled = 0;
var speed = 2;

var score = 0;
var highscore = 0;
var startTime;
var bestTime = 0;

var rounds = 10;
var totalTime = 10;

var contCount = 0;
var contArray = [];
var sound;

// Types
var REGULAR = "rgb(255, 255, 255)";
var BLACK = "rgb(0, 0, 0)";
var BOMB = "rgb(0, 0, 255)";

$(document).ready(function() {
	$("#playground, #gameover, #seekbar").css({
		top : (window.innerHeight - $("#playground").height()) / 2,
		left : (window.innerWidth - $("#playground").width()) / 2
	});
	
	$("#gameover").css({
		height : $("#playground").height(),
		width : $("#playground").width()
	});

	$(document).on('click', '.tile', function() {
		if($(this).css('background-color') == REGULAR || (mode[currMode] == 'bomb' && $(this).css('background-color') == BOMB)) {
			$(this).css('background-color', 'red');
			gameOver($(this));
			return;
		}
		if(sound) {
			sound.pause();
		}

		if(mode[currMode] == "classic") {
			if(!($(this).offset().top - $("#playground").offset().top == $("#playground").height() / 4 * 2 + 1) || contArray[$(this).parent().attr("id")]) {
				return;
			}
			sound = new Audio('sound/' + song + "/" + song + "-" + (score +1) + '.ogg');
			sound.play();	
			score++;
			$(this).css('background-color', 'lightgrey');
			newRow();
			$(".container, .end").animate({top : "+=" + ($("#playground").height() / 4)}, 100, function() {
				// Animation finished
			});
			if(contCount == rounds + 3) {
				$(".container, .end").animate({top : "+=" + ($("#playground").height() / 4)}, 100);
				var timer = window.setTimeout(function() {
					gameOver(false);
				}, 100);
			}
		}
		else if(mode[currMode] == 'arcade' || mode[currMode] == 'bomb') {
			var id = $(this).parent().attr("id");
			if(!started) {
				move();
			}
			if((id == 0 || contArray[id - 1]) && !contArray[id]) {
				sound = new Audio('sound/' + song + "/" + song + "-" + (score +1) + '.ogg');
				sound.play();
				$(this).css('background-color', 'lightgrey');
				contArray[id] = true;
				score++;
				highscore = (score > highscore) ? score : highscore;
			}
		}
	});
	$("#mode").html(mode[currMode]);
	init();
});

function init() {
	clearTimeout(timer);
	$("#gameover").fadeOut(300);
	$("#playground").empty();
	$("#seekbar").width(0);
	
	scrolled = 0;
	contCount = 0;
	contArray = [];
	started = false;
	score = 0;

	// Init green zone
	var start = document.createElement("div");
	start.id = "start";
	start.style.top = 3 * $("#playground").height() / 4 + "px";
	start.style.left = "0px";
	$("#playground").append(start);
	
	// Init first three rows
	for(var i = 0; i < 3; i++) {
		var cont = document.createElement("div");
		cont.className = "container";
		cont.id = 2 - i;
		cont.style.top = i * $("#playground").height() / 4 + "px";
		$("#playground").append(cont);
		var blackTile = null;
		for(var j = 0; j < 4; j++) {
			var tile = document.createElement("div");
			tile.id = "tile";
			tile.className = "tile";
			if(blackTile == null && (Math.random() >= 0.5 || j == 3)) {
				if(i == 2) {
					tile.innerHTML = "START";
					tile.style.lineHeight = $("#tile").height() + "px";
				}
				blackTile = j;
			}

			tile.style.backgroundColor = (blackTile == j) ? BLACK : REGULAR;
			$(cont).append(tile);
		}
		contArray.push(false);
		contCount++;
	}
	
	startTime = new Date().getTime();
}

function newRow() {
	if(mode[currMode] == "arcade" || mode[currMode] == "bomb" || contCount < rounds) {
		var cont = document.createElement("div");
		cont.className = "container";
		cont.id = contCount;
		cont.style.top = "-" + ($("#playground").height() / 4) + "px";
		$("#playground").append(cont);
	
		var blackTile = null;
		var bombTile = null;
		for(var j = 0; j < 4; j++) {
			var tile = document.createElement("div");
			tile.className = "tile";
			if(blackTile == null && (Math.random() >= 0.5 || j == 3)) {
				blackTile = j;
				if(mode[currMode] == "bomb" && Math.random() >= 0.7) {
					bombTile = j;
				}
			}
			tile.style.backgroundColor = (bombTile == j) ? BOMB : (blackTile == j) ? BLACK : REGULAR;
			$(cont).append(tile);
		}
		contArray.push(bombTile != null);
	}
	else if(mode[currMode] == "classic" && contCount == rounds) {
		var end = document.createElement("div");
		end.className = "end";
		end.style.top = "-" + $("#playground").height() + "px";
		$("#playground").append(end);
	}
	contCount++;
}

function move() {
	$("#seekbar").removeClass("hidden");
	newRow();
	started = true;
	timer = window.setInterval(function() {
		var time = new Date().getTime();
		var elapsed = time - startTime;
		if(elapsed > totalTime * 1000) {
			clearTimeout(timer);
			gameOver(false);
			return;
		}
		else {
			var width = (elapsed / (totalTime * 1000)) * $("#playground").width() + "px";
			$("#seekbar").width(width);
		}
		if(scrolled >= ($("#playground").height() / 4)) {
			scrolled = 0;
			newRow();
		}
		$(".container").css('top', function(i, v) {
			if(parseFloat(v) + $("#playground").offset().top > $("#playground").offset().top + $("#playground").height()) {
				if(contArray[$(this).attr("id") - 1] != undefined) {
					// Something
				}
				if(!contArray[$(this).attr("id")]) {
					gameOver($(i));
				}
				$(this).remove();
			}
			return (parseFloat(v) + speed) + 'px';
		});
		scrolled += speed;
	}, 10);
}

function gameOver(elem) {
	if(elem) {
		$("#gameover").css('background-color', 'red');
		var sound = new Audio('sound/boo.ogg');
		sound.play();
		elem.css('background-color', 'red');
	}
	else {
		$("#gameover").css('background-color', 'rgb(0,200,0)');
		var bgSnd = new Audio('sound/applause.ogg');
		bgSnd.play();
	}
	clearTimeout(timer);
	$("#seekbar").addClass("hidden");
	var endTime = new Date().getTime();
	var elapsed = (endTime - startTime) / 1000;
	var won = document.getElementById("won");
	if(mode[currMode] == "classic") {
		if(elapsed < bestTime || bestTime == 0) {
			bestTime = elapsed;
			$("#headline").html("New Highscore!");
		}
		else {
			$("#headline").html("Score:");
			$("#highscore").html("Highscore is: " + bestTime);
		}
		$("#score").html(elapsed + " s");
	}
	else if(mode[currMode] == "arcade" || mode[currMode] == "bomb") {
		if(score == highscore && score > 0) {
			$("#headline").html("New Highscore!");
		}
		else {
			$("#headline").html("Score:");
			$("#highscore").html("Highscore is: " + highscore);
		}
		$("#score").html(score);
	}
	$("#gameover").fadeIn(300);
}

function changeMode() {
	currMode = (currMode == mode.length - 1) ? 0 : currMode + 1;
	$("#mode").html(mode[currMode]);
	init();
}
