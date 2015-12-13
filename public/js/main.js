// ------------------Global variables declared here---------------------
var curSound;

var chimes, high_hat_01, high_hat_02, silent;
var soundOptions = [];

var soundString;
var generation = 0;
var totalCount = 0;
var like = 0;
var option =2;

var tempo = 450;
var playing = 0;

var initialRhythms = [];
var soundList = [];

var playSeq;
var seqCounter = 0;

var colorList = ["#9afe2e", "#d62d20", "#ffa700", "#ff0097", "#a200ff", "#66a3ff", "ffffff", "4254f2"];

// ------------------D3 append SVG and make circles-----------------------

var svg = d3.select("#container")
    .append("svg")
    // .attr("width", "100%")
    // .attr("height", "" + $("#container").width()*0.4)
    .attr("width", "960")
    .attr("height", "540")
    .style("fill", "black");

function makeCircles(length, cX, cY){
	cY = 280;
	cX = 480;
	var radius = $("#container").height()*0.38;
	// var cX = $("#container").width()*0.5;
	// var cY = $("#container").height()*0.5;
	var angle = 360/length;
	var radians = Math.PI/180;

	for (var i = 0; i < length; i ++){
		d3.select('svg')
	    .append("circle")
	    .attr("cx", cX+radius*Math.sin((angle*i)*radians))
		.attr("cy",  cY-radius*Math.cos((angle*i)*radians))
		.attr("r", 25)
		.attr("id", ""+i)
		.style("fill", colorList[totalCount])
		.style("stroke", colorList[totalCount])
		.style("stroke-width", 3)
		.style("opacity", 0.55);
	}
}

// ------------------Preloading all the sounds-----------------------
function preload(){

	high_hat_01 = loadSound('media/high_hat_01.wav');
	high_hat_01.playMode('sustain');
	high_hat_01.name = 'high_hat_01';
	soundOptions.push(high_hat_01);

	high_hat_02 = loadSound('media/high_hat_02.wav');
	high_hat_02.playMode('sustain');
	high_hat_02.name = 'high_hat_02';
	soundOptions.push(high_hat_02);

	clave = loadSound('media/clave.mp3');
	clave.playMode('sustain');
	clave.name = 'clave';
	soundOptions.push(clave);
	$("#pauseButton").hide();
}

function setup(){
	generateRandomRhythms(8);
	setString();
	makeCircles(16, $("#container").width()*0.5,$("#container").height()*0.5);
	changeColorCircles();
}

function draw(){
}

// ------------------Change color and style of things-----------------------
	
function makeHTML(){
	$("#generationTxt").html("Gen: ");
	$("#generation").html(generation);
	$("#totalTxt").html(" Rhythm: ");
	$("#total").html(totalCount%8);
}

function makeSlider(){
	$("#slider").slider({
		value:450,
		min: 300,
		max: 600,
		step: 25,
		slide: function( event, ui ) {
			tempo = ui.value;
			if (playing === 1){
				stopSeq();
				playSound(tempo);
			}
			console.log(tempo);
		}
	});
}

function changeColorCircles(){
	for (var i = 0; i < 16; i ++){
		if (soundString[i] == "1"){
			colorCircles(i, colorList[totalCount%colorList.length]);
			changeStroke();
		}
		else {
			colorCircles(i, "none");
		}
	}
}

function changeStroke(){
	svg.selectAll('circle')
        .style("stroke", colorList[totalCount%colorList.length]);
}

function transformCircles(plus,i){
	if (plus === "plus"){
		d3.selectAll("[id='" + i + "']")
        .attr("r", 33);
    }
    for (var j = 0; j < 16; j++){
    	if (j != i){
    		d3.selectAll("[id='" + j + "']")
        	.attr("r", 25);
    	}
    }
}

function colorCircles(i, color){
    d3.selectAll("[id='" + i + "']")
        .style("fill", color);
}
// Genetic
// ----------------- initial rhythms and strings-------------------

function generateRandomRhythms(number){
	for (var i = 0; i < number; i++){
		var initialSound = "";
		for (var j = 0; j < 16; j++){
			initialSound += Math.round(Math.random(0,1));
		}
		initialRhythms.push(initialSound);
	}
}

function setString(){
	soundString = initialRhythms[totalCount%8];
	console.log(initialRhythms);
}

// -----------------Genetic algorithm for new generations-------------------

function geneticAlgorithm(){
	var tempSound = "";

	for (var i = 0; i < 4; i++){
		var number = Math.floor(soundList.length*(biasHigh()));
		console.log(number);
		console.log(soundList.length);
		console.log(biasHigh());
		tempSound += soundList[number].substring(Number(4*i),Number(4*i+4));	
	}

	var mutate = Math.random(0,1);
	if (mutate > 0.9){
		var place = Math.floor((soundString.length-4)*Math.random(0,1));
		var tempSoundSub = tempSound.substring(place, place+4);
		tempSound = tempSound.replace(tempSoundSub, flip(tempSoundSub));
	}

	soundString = tempSound;
}

function flip(substring){
	var newSub = "";
	for (var i = 0; i < substring.length; i ++){
		newSub += Math.abs(Number(substring[i]) - 1);
	}
	return newSub;
}

// --------------Functions using random that mimic a probability distribution--------------

function biasLow(){
	var a = Math.random(0,1);
	var b = Math.random(0,1);
	var c = Math.random(0,1);
	return Math.min(a,b,c);
}

function biasMiddle(){
	var a = Math.random(0,1);
	var b = Math.random(0,1);
	var c = Math.random(0,1);
	return (a+b+c)/3;
}

function biasHigh(){
	var a = Math.random(0,1);
	var b = Math.random(0,1);
	var c = Math.random(0,1);
	return Math.max(a,b,c);
}

// -----------------Play and stop-------------------

function playSound(tempoVal){
	playSeq = setInterval(function(){
		if (soundString[seqCounter] == "1"){
			curSound = soundOptions[option];
			// curSound = soundOptions[2];
			curSound.play();
		}
		transformCircles("plus",seqCounter);
		seqCounter++;
		seqCounter = seqCounter%16;
	}, 700-tempoVal);
}

function stopSeq(){
	// console.log("Stop");
	clearInterval(playSeq);
}

// -------------Functions that deal with like/dislike-------------

function likeDislikeCommon(){
	
	playing = 0;
	stopSeq();
	seqCounter = 0;
	totalCount += 1;
	$("#pauseButton").hide();
	$("#playButton").show();
	$("#likeButton").hide();
	$("#dislikeButton").hide();
	var generationOld = generation;
	generation = Math.floor(totalCount/8);
	if (generationOld !== generation){
		newGeneration();
	}
	likeDislikeButtonClicked();
	transformCircles();

}

function newGeneration(){
	$("#generationDiv").show();
	$("#generationInfo2").html("Check out generation " + generation + "!");
	$("#mask").show();
	// console.log("NEW GENERATION");
}

function likeDislikeButtonClicked(){
	if (Number(generation) === 0 || soundList.length < 3){
		if (totalCount%8 === 0){
			initialRhythms = [];
			generateRandomRhythms(8);
		}
		setString();
	}
	else {
		geneticAlgorithm();	
	}
	makeHTML();
	// console.log(tempo);
	changeColorCircles();
}

// -----------------Button clicked-------------------

$("#instrument").click(function(){
	$("#instrumentDiv").show();
	$("#mask").show();
});

$("#instrument0").click(function(){
	$("#instrumentDiv").hide();
	$("#mask").hide();
	option = 0;
});

$("#instrument1").click(function(){
	$("#instrumentDiv").hide();
	$("#mask").hide();
	option = 1;
});

$("#instrument2").click(function(){
	$("#instrumentDiv").hide();
	$("#mask").hide();
	option = 2;
});

$("#helpButton").click(function(){
	$("#helpDiv").show();
	$("#mask").show();
});

$("#gotItButton").click(function(){
    $("#helpDiv").hide();
	$("#mask").hide();
});

$("#goBackButton").click(function(){
    $("#instrumentDiv").hide();
	$("#mask").hide();
});

$("#goBack2Button").click(function(){
    $("#apiDiv").hide();
	$("#mask").hide();
});

$("#checkOutButton").click(function(){
    $("#generationDiv").hide();
	$("#mask").hide();
});

$("#About").click(function(){
    var theLink = 'https://thespidermen.wordpress.com/';
    window.open(theLink);
});

$("#API").click(function(){
    $("#apiDiv").show();
	$("#mask").show();
});

$("#apiLink").click(function(){
	var theLink = 'https://thespidermen.wordpress.com/api';
    window.open(theLink);
    $("#apiDiv").hide();
	$("#mask").hide();
});

$("#countryLink").click(function(){
	var theLink = 'https://breedingrhythms.herokuapp.com/api/country=India';
    window.open(theLink);
    $("#apiDiv").hide();
	$("#mask").hide();
});

$("#nameLink").click(function(){
	var theLink = 'https://breedingrhythms.herokuapp.com/api/name=Abhimanyu';
    window.open(theLink);
    $("#apiDiv").hide();
	$("#mask").hide();
});

$("#likeButton").click(function(){
	soundList.push(soundString);
	like += 1;
	likeDislikeCommon();
});

$("#dislikeButton").click(function(){
	likeDislikeCommon();
});

$("#playButton").click(function(){
	playSound(tempo);
	$("#pauseButton").show();
	playing = 1;
	$("#playButton").hide();
	$("#likeButton").show();
	$("#dislikeButton").show();
	// console.log("play");
});

$("#pauseButton").click(function(){
	// console.log("pause");
	playing = 0;
	$("#playButton").show();
	$("#pauseButton").hide();
	stopSeq();
});

//------------------FORM SUBMIT---------------

$('#submitButton').click(function(){
	$('#mask').show();
	popup();
	stringHTML();
});

function popup() {
	$("#submitDiv").show();
}

// var countries = ['Aruba', 'Andorra', 'Afghanistan', 'Angola', 'Albania','United Arab Emirates', 'Argentina', 'Armenia', 'American Samoa', 'Antigua and Barbuda', 'Australia', 'Austria', 'Azerbaijan', 'Burundi', 'Belgium', 'Benin', 'Burkina Faso', 'Bangladesh', 'Bulgaria', 'Bahrain', 'Bahamas', 'Bosnia and Herzegovina', 'Belarus', 'Belize', 'Bermuda', 'Bolivia', 'Brazil', 'Barbados', 'Brunei Darussalam', 'Bhutan', 'Botswana', 'Central African Republic', 'Canada', 'Switzerland','Chile', 'China', "Côte d'Ivoire", 'Cameroon', 'Congo', 'Colombia', 'Comoros', 'Cabo Verde', 'Costa Rica', 'Cuba', 'Curacao', 'Cayman Islands', 'Cyprus', 'Czech Republic', 'Germany', 'Djibouti', 'Dominica', 'Denmark', 'Dominican Republic', 'Algeria', 'Ecuador', 'Egypt', 'Eritrea', 'Spain', 'Estonia', 'Ethiopia', 'Finland', 'Fiji', 'France', 'Gabon', 'United Kingdom', 'Georgia', 'Ghana', 'Guinea', 'Gambia', 'Guinea-Bissau', 'Equatorial Guinea', 'Greece', 'Grenada', 'Greenland', 'Guatemala', 'Guam', 'Guyana','Honduras', 'Croatia', 'Haiti', 'Hungary', 'Indonesia', 'Isle of Man', 'India', 'Ireland', 'Iran, Islamic Republic of', 'Iraq', 'Iceland', 'Israel', 'Italy', 'Jamaica', 'Jordan', 'Japan', 'Kazakhstan', 'Kenya', 'Kyrgyzstan', 'Cambodia', 'Kiribati', 'St. Kitts and Nevis', "Korea, Democratic People's Republic of", 'Kosovo', 'Kuwait', "Lao People's Democratic Republic", 'Lebanon', 'Liberia', 'Libya', 'Saint Lucia', 'Liechtenstein', 'Sri Lanka', 'Lesotho', 'Lithuania', 'Luxembourg', 'Latvia', 'Macao', 'Saint Martin (French part)', 'Morocco', 'Monaco', 'Moldova', 'Madagascar', 'Maldives', 'Mexico', 'Marshall Islands', 'Macedonia, the Former Yugoslav Republic of', 'Mali', 'Malta', 'Myanmar', 'Montenegro', 'Mongolia', 'Northern Mariana Islands', 'Mozambique', 'Mauritania', 'Mauritius', 'Malawi', 'Malaysia', 'Namibia', 'New Caledonia', 'Niger', 'Nigeria', 'Nicaragua', 'Netherlands', 'Norway', 'Nepal', 'New Zealand', 'Oman', 'Pakistan', 'Panama', 'Peru', 'Philippines', 'Palau', 'Papua New Guinea', 'Poland', 'Puerto Rico', 'Portugal', 'Paraguay', 'French Polynesia', 'Qatar', 'Romania', 'Russian Federation', 'Rwanda', 'Saudi Arabia', 'Sudan', 'Senegal', 'Singapore', 'Solomon Islands', 'Sierra Leone', 'El Salvador', 'San Marino', 'Somalia', 'Serbia', 'South Sudan','Sao Tome and Principe', 'Suriname', 'Slovak Republic', 'Slovenia', 'Sweden', 'Swaziland', 'Sint Maarten (Dutch part)', 'Seychelles', 'Syrian Arab Republic', 'Turks and Caicos Islands', 'Chad', 'Togo', 'Thailand', 'Tajikistan', 'Turkmenistan', 'Timor-Leste', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Tuvalu', 'Tanzania', 'Uganda', 'Ukraine', 'Uruguay', 'United States', 'Uzbekistan', 'Saint Vincent and the Grenadines', 'Venezuela, Bolivarian Republic of', 'Virgin Islands (U.S.)', 'Vietnam', 'Vanuatu','Samoa', 'Yemen', 'South Africa', 'Congo, the Democratic Republic of the', 'Zambia', 'Zimbabwe'];

// //Taken from http://twitter.github.io/typeahead.js/examples/
// var substringMatcher = function(strs) {
//       return function findMatches(q, cb) {
//           var matches, substrRegex;

//           // an array that will be populated with substring matches
//           matches = [];

//           // regex used to determine if a string contains the substring `q`
//           substrRegex = new RegExp(q, 'i');

//           // iterate through the pool of strings and for any string that
//           // contains the substring `q`, add it to the `matches` array
//           $.each(strs, function(i, str) {
//               if (substrRegex.test(str)) {
//                   // the typeahead jQuery plugin expects suggestions to a
//                   // JavaScript object, refer to typeahead docs for more info
//                   matches.push({ value: str });
//               }
//           });

//           cb(matches);
//       };
// };

// $('#country').typeahead({
//           hint: false,
//           highlight: true,
//           minLength: 3
//       },
//       {
//           name: 'countries',
//           displayKey: 'value',
//           source: substringMatcher(countries)
//       });


//------------------DATABASES---------------

function stringHTML() {
	var submitString = "";
	for (var i = 0; i < soundString.length; i ++){
		if (soundString[i] == "1"){
			submitString += "X";
		}
		else {
			submitString += ".";
		}
		submitString += " ";
	}
	$("#stringSubmit").html("Rhythm: " + submitString);
}

$("#submitFormButton").click(function() {
	$("#submitDiv").hide();
	var username = $("#name").val() || 'Rhythm enthusiast';
	$("#thanksText1").html(username + ", here are your numbers:");
	$("#thanksText2").html("You liked " + like + " rhythms.");
	$("#thanksText3").html("You disliked " + Number(totalCount-like) + " rhythms");
	$("#thanksDiv").show();
	var binSeq = soundString || "none";
	var namePerson =  $("#name").val() || 'YOU';
	var timeStamp = new Date();
	var country = $("#country").val() || 'everywhere';
	var comments = $("#comments").val() || 'cool';

	//Create data object to be saved
	var data = {
		name: namePerson,
		rhythmSeq: binSeq,
		date: timeStamp,
		country: country,
		likes: like,
		dislikes: totalCount-like,
		generation: generation,
		rhythmNum: totalCount%generation,
		total: totalCount,
		comments: comments
	};
	console.log(data);
	saveData(data);
});

$("#cancelFormButton").click(function() {
	$('#mask').hide();
	$("#submitDiv").hide();
});

$("#thanksKeepGoingButton").click(function() {
	$('#mask').hide();
	$("#thanksDiv").hide();
});

$("#thanksRestartButton").click(function() {
	$('#mask').hide();
	$("#thanksDiv").hide();
});

function saveData(obj){
	$.ajax({
		url: '/save',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(obj),
		error: function(resp){
			console.log("Oh no...");
			console.log(resp);
		},
		success: function(resp){
			console.log('WooHoo!');
			console.log(resp);
		}
	});
}

//------------------WINDOW RESIZE---------------
function windowResized() {
	// sizeChange();
}

function sizeChange() {
    // $("svg").height($("#container").width());
    svg.selectAll("*").remove();
	makeCircles(16, $("#container").width()*0.5, $("#container").height()*0.5);
	changeColorCircles();
}

$(document).ready(function(){
	$("#helpDiv").show();
	$("#mask").show();
	$("#tempo").show();
	$("#playButton").show();
	makeHTML();
	makeSlider();
});
