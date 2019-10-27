"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require("fs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


//Get and post requests

app.get('/people', function(req,resp){
	fs.readFile( __dirname + "/" + "league.json", 'utf8', function (err, data) {
		data = JSON.parse(data);
		return resp.json(data.players);
	})	
})

app.get('/people/:username', function(req,resp){
	var username=req.params.username;
	fs.readFile( __dirname + "/" + "league.json", 'utf8', function (err, data) {
		data = JSON.parse(data);
		return resp.json(data.players[username]);
	})	
})

app.get('/contactInfo', function(req, resp){
	const username = req.query.username;
	
	fs.readFile( __dirname + "/" + "league.json", 'utf8', function (err, data) {
		data = JSON.parse(data);
		return resp.json(data.players[username]);
	})
})

app.post("/login", function(req, resp){
	//need to add admin login
	const username = req.body.username;
	const pwd = req.body.pwd;
	const accountType = req.body.accountType;

	fs.readFile( __dirname + "/" + "league.json", 'utf8', function (err, data) {
		data = JSON.parse( data );
		var accounts;
		var successReply;
		var testAccount;
		
		if(accountType==="admin")
		{
			accounts = data.admins
			successReply = "admin"	
		}
		else{
			accounts = data.players
			successReply = username;
		}
		
		for (testAccount in accounts){
			if ((accounts[testAccount].username === username) && (accounts[testAccount].pwd === pwd)){
				return resp.json(successReply);
				}	
		}
		return resp.status(403).json("notPresent");
	}
)}
)



app.post("/people", function(req, resp){
	var data = req.body;
	var rawLeagueData = fs.readFileSync("league.json")
	var leagueData = JSON.parse(rawLeagueData);
	var username = data.username
	var accessToken = data.access_token
	if(!(accessToken === "concertina")){
		return resp.status(403).end('Incorrect or no access token supplied');
	}
	else if(Object.keys(leagueData.players).includes(username)){
		return resp.status(400).end('Username is already in use');
	}
 
	var newPlayer = {"username": username, "pwd": data.password, "forename": data.firstname, "surname": data.lastname, "phoneNumber": data.phoneNumber, 
	"email": data.email, "homeCourt": data.homeCourt, "picture": data.imageFilePath, "won": 0, "lost": 0, "gamesWon": 0, "gamesLost": 0}
	leagueData.players[username] = newPlayer;
	
	rawLeagueData = JSON.stringify(leagueData, null, 2);  
	fs.writeFileSync('league.json', rawLeagueData);
	resp.status(201).json("user created");
	
 })
 
app.post("/deletePlayer", function(req, resp){
	var rawLeagueData = fs.readFileSync("league.json")
	var leagueData = JSON.parse(rawLeagueData);
	var username = req.body.username
	
	delete leagueData.players[username];
	
	rawLeagueData = JSON.stringify(leagueData, null, 2);  
	fs.writeFileSync('league.json', rawLeagueData);
	return resp.json("player deleted")
})

app.post("/clearLeague", function(req, resp){
	var rawLeagueData = fs.readFileSync("league.json");
	var leagueData = JSON.parse(rawLeagueData);

	
	for(var playerID in leagueData.players){
		leagueData.players[playerID].won = 0;
		leagueData.players[playerID].lost = 0;
		leagueData.players[playerID].gamesWon = 0;
		leagueData.players[playerID].gamesLost = 0;
	}
	
	leagueData.weeksPlayed = 0;
	leagueData.leaguePositions = [];
	leagueData.results = [];
	leagueData.fixtures = [];
	
	rawLeagueData = JSON.stringify(leagueData, null, 2);  
	fs.writeFileSync('league.json', rawLeagueData);
	return resp.json("League cleared")
	})
	
	
	
app.post("/newLeague", function(req, resp){
	var rawLeagueData = fs.readFileSync("league.json")
	var leagueData = JSON.parse(rawLeagueData);
	
	leagueData.fixtures = createFixtures(leagueData)
	
	rawLeagueData = JSON.stringify(leagueData, null, 2);  
	fs.writeFileSync('league.json', rawLeagueData);
	return resp.json("New league started")	
})

app.get("/player", function(req, resp){
	const playerID = req.query.playerID;
	fs.readFile( __dirname + "/" + "league.json", 'utf8', function (err, data) {
		data = JSON.parse( data );
		return resp.json(data.players[playerID])
	})
})

app.get('/leagueTable', function(req, resp){
	updateLeague()
	fs.readFile( __dirname + "/" + "league.json", 'utf8', function (err, data) {
		data = JSON.parse( data );
		return resp.json({leaguePositions: data.leaguePositions, players: data.players});
	})
})

app.get('/fixtures', function(req, resp){
	fs.readFile( __dirname + "/" + "league.json", 'utf8', function (err, data) {
		data = JSON.parse( data );
		return resp.json({matchList: data.fixtures, players: data.players, weeksPlayed: data.weeksPlayed});
	})
})

app.get('/results', function(req, resp){
	fs.readFile( __dirname + "/" + "league.json", 'utf8', function (err, data) {
		data = JSON.parse( data );
		return resp.json({matchList: data.results, players: data.players, weeksPlayed: data.weeksPlayed});
	})
})

app.get('/resultsAndFixtures', function(req, resp){
	fs.readFile( __dirname + "/" + "league.json", 'utf8', function (err, data) {
		data = JSON.parse( data );
		return resp.json({results: data.results, fixtures: data.fixtures});
	})
})

app.post('/submitResults', function(req, resp){
	
	var rawLeagueData = fs.readFileSync("league.json")
	var leagueData = JSON.parse(rawLeagueData);

	
	var weekFixture = leagueData.fixtures.shift();
	var weekResult = []
	
	for(var i=0; i<weekFixture.length; i++){
		var homePlayerID = weekFixture[i][0]
		var awayPlayerID = weekFixture[i][1]
		var homeGames = req.body[homePlayerID];
		var awayGames = req.body[awayPlayerID];
		weekResult.push([[homePlayerID, homeGames],[awayPlayerID,awayGames]]);
		updatePlayerStats(leagueData.players[homePlayerID], parseInt(homeGames), parseInt(awayGames))
		updatePlayerStats(leagueData.players[awayPlayerID], parseInt(awayGames), parseInt(homeGames))
	}	
	leagueData.results.unshift(weekResult);
	leagueData.weeksPlayed++;
	
	rawLeagueData = JSON.stringify(leagueData, null, 2);  
	fs.writeFileSync('league.json', rawLeagueData);
	
	updateLeague();
	if(leagueData.fixtures === []){
		return resp.json("finished");
	}
	else{
		return resp.json("success");	
	}
})

//Backend fixture creation and proccesing

function updatePlayerStats(player, playerGames, oppoGames){
	
	player.gamesWon += playerGames;
	player.gamesLost += oppoGames;
	if(playerGames>oppoGames){
		player.won++
	}
	else{
		player.lost++
	}
}

function updateLeague(){
	var rawLeagueData = fs.readFileSync("league.json")
	var leagueData = JSON.parse(rawLeagueData);
	leagueData.leaguePositions = [];
	
	var username;
	for (username in leagueData.players){
		var currentPlayer = leagueData.players[username]
		var addedToLeague = false;
		for (var i=0; i<leagueData.leaguePositions.length; i++){
			var leaguePositionedPlayer = leagueData.players[leagueData.leaguePositions[i]]
			if (leaguePositionedPlayer.won===currentPlayer.won){
				if ((leaguePositionedPlayer.gamesWon - leaguePositionedPlayer.gamesLost) < (currentPlayer.gamesWon - currentPlayer.gamesLost)){
					leagueData.leaguePositions.splice(i,0,username)
					addedToLeague = true
					break;
				}
			}
			else if (leaguePositionedPlayer.won<currentPlayer.won){
				leagueData.leaguePositions.splice(i,0,username)
				addedToLeague = true
				break;
			}
		}
		if (!addedToLeague){
			leagueData.leaguePositions.push(username)
		}
	}

	rawLeagueData = JSON.stringify(leagueData, null, 2);  
	fs.writeFileSync('league.json', rawLeagueData);

}


function createFixtures(leagueData){	
	//Set number of players and games if odd number of players need dummy player
	var playerKeys = Object.keys(leagueData.players) 
	var numPlayers = playerKeys.length
	var oddNumPlayers = false;
	if (numPlayers%2===1){
		numPlayers++;
		oddNumPlayers = true
		playerKeys.push("ghost")
	}
	const numGames = numPlayers/2
	const numWeeks = numPlayers-1
	
	//Create initial home and away arrays
	var home=[];
	var away=[];
	for (var i = 0; i < numGames; i++) {
		home.push(playerKeys[i]);
	}
	for (i = numGames; i < numPlayers; i++) {
		away.push(playerKeys[i]);
	}
	
	var fixtureList=[];
	var reverseFixtureList =[];
	
	for(i=0; i<numWeeks; i++){
		var weekFixture=[]		
		var reverseWeekFixture=[]

		for(var j=0; j<numGames; j++){
			if(!((oddNumPlayers)&&((home[j]==="ghost")||(away[j]==="ghost")))){
				weekFixture.push([home[j],away[j]]);
				reverseWeekFixture.push([away[j],home[j]]);
			}
		}
		fixtureList.push(weekFixture);
		reverseFixtureList.push(reverseWeekFixture);
		away.push(home.pop());
		home.splice(1,0,away.shift());
	}
	reverseFixtureList.reverse();
	for(i=0; i<numWeeks; i++){
		fixtureList.splice((2*i)+1,0,reverseFixtureList[i])
	}
	
	return fixtureList;
}

module.exports = app;



