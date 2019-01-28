

$(document).ready(function(){
	$(".main").hide();
	if(checkAccountType()){
		loadPageData();
		$(".main").show();
	}
})



function loadPageData(){
//Load data to player and admin pages
	if(window.location.href.includes("admin.html")){
		updateAdminPlayerList();
		inputResultsPresent = loadMatchList("#inputResults");
	}
	loadLeagueTable();
	if(window.location.href.includes("player.html")){
		loadContactDetails();	
	}
	loadMatchList("#fixtureList");
	loadMatchList("#resultsList");

	setupAdminTools();
}

function loadLeagueTable(){
				$("#leagueTable td").parent().remove();
				$.get("http://127.0.0.1:8090/leagueTable", function (data) {
					var leaguePositions = data.leaguePositions;
					var players = data.players
					for (var i=0; i<leaguePositions.length; i++){
						var player = players[leaguePositions[i]]
						var name = player.forename + " " + player.surname
						var played = player.won + player.lost
						var gameDifference = player.gamesWon - player.gamesLost
						var link = 'player.html#'+ player.username
						$('#leagueTable').append("<tr class='datarows'><td>"+(i+1)+"</td><td><a href =" + link + ">"+name+"</a></td><td>"+played+"</td><td>"+player.won+"</td><td>"+
						player.lost+"</td><td>"+player.gamesWon+"</td><td>"+player.gamesLost+"</td><td>"+gameDifference+"</td><td>"+
						(player.won*3)+"</td></tr>")
					}
				})
				}

function changePlayer(username){
	window.location = "player.html#"+ username;
	loadPageData();
}
				
function loadMatchList(ele){
	var currentPlayerID;
	var numWeeksToLoad;
	var getRequest;
	$(ele).empty();
	
	if (ele==="#resultsList"){
		getRequest = "http://127.0.0.1:8090/results"
	}
	else{
		getRequest = "http://127.0.0.1:8090/fixtures"
	}

		$.get(getRequest, function (data) {
			var matchList = data.matchList
			if(matchList.length===0){
				return false
				}
			
			var players = data.players
			var weeksPlayed = data.weeksPlayed
			
			if(ele === "#inputResults"){
				numWeeksToLoad = 1;
			}
			else{
				var currentUser = window.location.hash.substring(1);
				numWeeksToLoad = matchList.length;
			}
			for(var i = 0;i<numWeeksToLoad; i++){
				for(var j = 0; j<matchList[i].length; j++){
					var match = matchList[i][j];
					if (match[0].constructor === Array){
						match = [match[0][0],match[1][0]]
					}
					if(window.location.href.includes("admin.html")||((match[0] === currentUser) || (match[1] === currentUser))){
						getMatch(matchList[i][j], i, weeksPlayed, ele, players);		
					}
				}
			}
		})
}
		
function getMatch(match, indexNumber, weeksPlayed, ele, players){
	var homePlayer;
	var awayPlayer;
	var score;
	var connector;
	var week;
	if (match[0].constructor === Array){
		week = weeksPlayed - indexNumber;

		homePlayer = players[match[0][0]];
		awayPlayer = players[match[1][0]];
		var score = [match[0][1], match[1][1]];
		if (score[0] > score[1]){
			connector= " beat "
		}
		else{
			connector= " lost "
		}
	}
	else{
		week = weeksPlayed + indexNumber+ 1;
		homePlayer = players[match[0]];
		awayPlayer = players[match[1]];
		connector = " vs "
	}
	
	var homeFunction =  "changePlayer('"  + homePlayer.username + "')"
	var awayFunction =  "changePlayer('"  + awayPlayer.username + "')"
	
	$(ele).append("<img src=" + homePlayer.picture + " height='75' align='left'>")
	$(ele).append("<img src=" + awayPlayer.picture + " height='75' align='right'>")
	$(ele).append("<p style='text-align :center'><b>Week: " + week + "</b></p>")
	$(ele).append("<p style='text-align :center'><a href = 'player.html#" + homePlayer.username + "' onclick=" + homeFunction + ">" + 
	homePlayer.forename +" " + homePlayer.surname + "</a>" + connector + "<a href = 'player.html#" + awayPlayer.username + "' onclick=" + awayFunction + ">" + awayPlayer.forename + " " + awayPlayer.surname+ "</a></p>");
	
	
	if (match[0].constructor === Array){
		$(ele).append("<p style='text-align :center'>"+ score[0] + "-" + score[1] + "</p>")
	}	
	else if(ele === '#fixtureList'){
		$(ele).append("<p style='text-align :center'>Venue: "+ homePlayer.homeCourt + "</p>")
	}
	else if(ele === "#inputResults"){
		$(ele).append('<div style="text-align:center"><fieldset><input type="number" min="0" max="7" name=' + homePlayer.username + ' size="1" "> - <input type="number" min="0" max="7" name=' + awayPlayer.username + ' size="1"></fieldset></div>')
	}
	$(ele).append("<br>")
}
		

function setupAdminTools(){
//Set visibility of varying elements of admin tools depending on league state
	$.get("http://127.0.0.1:8090/resultsAndFixtures", function (data) {
		var resultsPresent = true;
		var fixturesPresent =true;
		if(data.results.length === 0){
			resultsPresent = false;			
		}
		if(data.fixtures.length ===0){
			fixturesPresent = false;			
		}
		
		$(".fixtureTab").hide();
		$(".resultTab").hide();
		$("#newLeague").hide();
		$("#startNewLeague").hide();
		$("#weeklyResults").hide();
		
		if(!(resultsPresent)&& !(fixturesPresent)){
			//Start new league visible
			$("#newLeague").show();
			$("#newPlayer").hide();
			$("#removePlayer").hide();			
		}	
		else if((resultsPresent)&& !(fixturesPresent)){
			//Create new league and delete previous
			$(".resultTab").show();
			$("#startNewLeague").show();
		}
		else{
			//Weekly results
			$(".fixtureTab").show();
			$(".resultTab").show();
			$("#startNewLeague").show();
			$("#weeklyResults").show();
		}
	})
	
}

function loadContactDetails(){
//Populate contact details page
	$.get("http://127.0.0.1:8090/contactInfo", "username=" + window.location.hash.substring(1), function (player) {
		$("#playerName").html(player.forename + " " + player.surname);
		$("#email").html("Email: " + player.email);
		$("#phoneNumber").html("Phone number: " + player.phoneNumber);
		$("#homeCourt").html("Home Court: " + player.homeCourt);
		$("#playerPic").attr("src",player.picture);
		//$("#leaguePos").attr("League Position: " + );
		//$("#WL").attr("Win/Loss: " + player.win + "/" + player.lost);
		//$("#leaguePos").attr("Latest Result: " + );
		//$("#leaguePos").attr("Next Match: " + );
		/*
						<h3>Tournament Infomation</h3>
						<div id="leaguePos"></div>
						<div id="WL"></div>
						<div id="lastResult"></div>
						<div id="nextMatch"></div> */
	})				   
 };
 
function updateAdminPlayerList(){
	$('#playerList').empty();
	$('#deletePlayerSelect').empty();
	var player;
	$.get("http://127.0.0.1:8090/people", function(data){
		for (player in data){
			var playerName =  data[player].forename + " " + data[player].surname;
			var homeFunction =  "changePlayer('"  + player + "')"
			$('#playerList').append("<li><a href = 'player.html#" + player + "' onclick=" + homeFunction + ">" + playerName + "</li>");
			$('#deletePlayerSelect').append("<option value='" + player + "'>" + playerName + "</option>");
			
		}
	})
}
 
function showAndHideElement(showEle, hideEle){
	$(showEle).show();
	$(hideEle).hide();
}
 

function checkAccountType(){
//Use cookies set on login to determine if access is granted to player and admin pages
	var accountTypeCookie = getAccountTypeCookie();
	var expectedCookie;
	if(window.location.href.includes("admin.html")){
		expectedCookie= ["admin"];
	}
	else{
		expectedCookie= ["admin","player"];
	}
	if(!(expectedCookie.includes(accountTypeCookie))){
		window.alert("You do not currently have privileges to view this account type \nPlease login with a different account and try again");
		window.location = "home.html"	
		return false
	}
	else{
		return true
	}
}

function getAccountTypeCookie() {
//Code adapted from- https://www.w3schools.com/js/js_cookies.asp
	var name = "accountType=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');

	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
		  c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
		  return c.substring(name.length, c.length);
		}
	}
	return "";
} 

//Clickable row: https://www.electrictoolbox.com/jquey-make-entire-table-row-clickable/
$(document).on("click", "#leagueTable tr", function(e) {
	var href = $(this).find("a").attr("href");
	if(href) {
		window.location = href;
		loadPageData();
		}
});
	
$("#resultsForm").submit(function( event ) {
	event.preventDefault();
	$.post("/submitResults", $('#resultsForm').serialize(), function (resp){
		loadPageData();
	})
});

$("#newPlayerForm").submit(function( event ) {
	event.preventDefault();
	//Adds file path of selcted image to serialized form data
	var avatarImageFilePath = $('#uploadPicture').val();
	var lastIndex = avatarImageFilePath.lastIndexOf("avatar");
	avatarImageFilePath = "/images/playerImgs/avatarImgs/" + avatarImageFilePath.slice(lastIndex);
	var formData = $('#newPlayerForm').serialize() + "&imageFilePath=" + avatarImageFilePath + "&access_token=concertina";

	$.post("/people", formData, function(data){
		loadPageData();
		$('#newPlayerForm').empty();
	})
	.fail(function(response) {
        alert(response.responseText);
	});
})

$("#deletePlayerForm").submit(function( event ) {
	event.preventDefault();
	if (confirm("Are you sure you want to remove " + $("#deletePlayerSelect option:selected").text() + "?")){
	$.post("/deletePlayer", "username=" +  $("#deletePlayerSelect").val(), function(data){
		loadPageData();
	})
	}
})
	
$("#startNewLeagueButton").click(function(event){
	event.preventDefault();
	if (confirm("Are you sure you want to start a new league?\nAll previous league data will be lost.")){
		$.post("http://127.0.0.1:8090/clearLeague", function(req, resp){
		loadPageData();
	})
	}
})


$("#createNewLeague").click(function(event){
	event.preventDefault();
	if (confirm("Are you sure you want to create a new league?\n")){
		$.post("http://127.0.0.1:8090/newLeague", function (data) {
			loadPageData();
	})
	}
})

