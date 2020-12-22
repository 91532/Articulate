"use strict";
let team1Marker='<span class="sqrBig">&#9822</span>';
let team2Marker='<span class="sqrBig">&#9820</span>';
let categories = ["Object", "Nature", "Person", "Action", "Spade", "Random", "World"];
let gameVersion="";
let turnScore = -1;
let gamePlay = "";
let gameID = "";

function pageLoad() { //when the page loads this function will start.
    console.log("Page is loading...");
    gameVersion = getUrlParameter("gameVersion"); // this will make sure that the correct elements load based off of what version of the game the user chooses
    gameID = getUrlParameter("gameID");
    if (gameID <= 0) { //if the game ID is less than or equal to 0 then a new game will start
        let frmTarget = "/score/put/newGame";
        const result = fetch(frmTarget, {method: "POST"}).then(response =>{
            return response.json();
        }).then( response => {
            if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                alert("Error Generating Game ID!  Unable to Continue!")    // if it does, convert JSON object to string and alert
                gameRedirect("/client/home.html");
            } else {
                gameID = response.gameID;
                gameRedirect("/client/game.html?gameVersion="+gameVersion+"&gameID="+gameID);
            }
        });
    }
    if (gameID > 0){ //if the game ID is greater than 0 then an existing game will be loaded with the scores of each team and which team's turn it is displayed on the screen
        const gameStats = fetch("/score/get/" + gameID, {method: "GET"})
            .then(response => {
                return response.json();             //return response to JSON
            }).then(response => {
                if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                    alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert
                } else {
                    gamePlay = response.gamePlay;
                    refreshBoard(response.team1Score, response.team2Score, response.gamePlay);
                }
            });
    }
}

function refreshBoard(t1Score, t2Score, gPlay){ //this function updates the score, position of the counters and who's playing at the end of every turn (when the 60 second timer is finished)
    let cnum = 0;
    updateScores(t1Score, t2Score);
    updateMarkers(t1Score, t2Score);
    if ( gPlay == "Team1") {
        document.getElementById("gamePlay").innerHTML = team1Marker + " " + gPlay + " " + team1Marker + " ";
        cnum = t1Score % 7;
    }
    if ( gPlay == "Team2") {
        document.getElementById("gamePlay").innerHTML = team2Marker + " " + gPlay + " " + team2Marker + " ";
        cnum = t2Score % 7;
    }
    if (cnum > 0) { cnum--; }
    document.getElementById("frm_Category").value = categories[cnum];
}

function updateMarkers(t1Score, t2Score) { // this function is linked to the refreshBoard function. This function makes sure that the markers are in the right place on the board depending on the scores of each team.
    clearAllSquares();
    drawMarkers(t1Score, t2Score);
}

function clearAllSquares(){
    for (let id=0; id<=56; id++){
        let el = "sqr"+id;
        document.getElementById(el).innerHTML = "";
    }
}

function drawMarkers(t1Score, t2Score) { //this function is specifically to draw the markers on the board. This is to position them correctly inside the boaxes
    let el= "";
    let iHTML = "";
    if (t1Score == t2Score) {
        el = "sqr" + t2Score;
        iHTML = "<div>" + team1Marker + team2Marker + "</div>";
        document.getElementById(el).innerHTML = iHTML;
    } else {
        el = "sqr" + t1Score;
        iHTML = "<div>" + team1Marker + "</div>";
        document.getElementById(el).innerHTML = iHTML;
        el = "sqr" + t2Score;
        iHTML = "<div>" + team2Marker + "</div>";
        document.getElementById(el).innerHTML = iHTML;

    }
}

function updateScores(t1Score, t2Score) {// when this function is called when the scores need to be updated.
    document.getElementById("t1Score").innerHTML = team1Marker + " " + t1Score; // this returns all the elements that have the id "t1Score"
    document.getElementById("t2Score").innerHTML = team2Marker + " " + t2Score; // this returns all the elements that have the id "t2Score"
}

function gameRedirect(newURL){ // this function is used to either redirect the user back to the home page if there is an error or direct them to the page where they can play the game
    window.location.replace(newURL);
}


function getUrlParameter(name) { // this function is for the javascript to be able to the paramaters in the URL.
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getContent(url, dstElement, active="Home") { //This function is used to include the contents of the topnav.html file in all of the other pages.
    console.log("Getting file: " + url);
    fetch(url, {method: "GET"}).then( response => {
        return response.text();
    }).then (response => {
        document.getElementById(dstElement).innerHTML = response;
        document.getElementById("topnav" + active).classList.add("active");
    });
}

function getWord() { // when the original version of the game is chosen this function is called to get the words from the database
    console.log("Invoked getWord()");
    const category = document.getElementById("frm_Category").value;   //get value from Category
    const url = "/card/get/Category/";		        // API method on webserver will be in card class with @Path of category
    fetch(url + category + "/original", {        			// Category as path param
        method: "GET",
    }).then(response => {
        return response.json();             //return response to JSON
    }).then(response => {
        if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
            alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert
        } else {
            document.getElementById("wordValue").value = response.Word;
        }
    });
}
function getWordKids() { // when the kids version of the game is chosen this function is called to get the words from the database
    console.log("Invoked getWordKids()");
    const category = document.getElementById("frm_Category").value;   //get value from Category
    const url = "/card/get/Category/";		        // API method on webserver will be in card class with @Path of category
    fetch(url + category + "/kids", {        			// Category as path param
        method: "GET",
    }).then(response => {
        return response.json();             //return response to JSON
    }).then(response => {
        if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
            alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert
        } else {
            document.getElementById("wordValue").value = response.Word;
        }
    });
}
function getWordWrapper(){ // this function is used to make sure that the correct table of words is used depending on the gameVersion.
    console.log("Invoked Wrapper");
    let strGameVersion = getUrlParameter('gameVersion');
    if(strGameVersion == 'kids'){
        getWordKids();
    }else{
        getWord();
    }
    turnScore = turnScore + 1;
}

function startPlayerTurn(){ // this function is used at the start of each team's turn. In this function the countdown and getWordWrapper functions are called.
    countdown();
    getWordWrapper();
    document.getElementById("playerTurn").disabled = true;
}

//set seconds
let timeLeft = 60;
let theTimer = null;

function refreshTimer(){// this function is for the refreshing the timer after each round.
    timeLeft--;
    let secondsString = String(timeLeft % 60);
    document.getElementById("seconds").innerHTML = (secondsString.length == 1 ? "0" : "") + secondsString;
    if (timeLeft < 0) {
        console.log("timeLeft Magically reduced");
        clearInterval(theTimer);// makes sure the timer doesn't go negative
        //alert("Whooops time up!");
        // at the end of each round 00 seconds are displayed on the screen and you can no longer click any of the buttons.
        document.getElementById("seconds").innerHTML = "00";
        document.getElementById("nextWord").disabled = true;
        document.getElementById("timePlay").disabled = true;
        document.getElementById("timePause").disabled = true;
        let url = "/score/update"; // the score is then updated in the database
        let frmData = new FormData();
        frmData.append("gameID", gameID);
        frmData.append("teamName", gamePlay);
        frmData.append("turnScore", turnScore);
        fetch(url, {method: "POST", body: frmData}).then( response => {
            return response.json();
        }).then (response => {
            if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
                alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert
            } else {
                gameRedirect("/client/game.html?gameVersion="+gameVersion+"&gameID="+gameID);
            };
        });

    }
}

//countdown function is evoked when page is loaded
function countdown() {
    theTimer = setInterval(refreshTimer, 1000);
    document.getElementById("timePlay").disabled = true;
    document.getElementById("timePause").disabled = false;
}

function stopcountdown() { //this function is to stop the countdown.
    clearInterval(theTimer);
    document.getElementById("timePlay").disabled = false;
    document.getElementById("timePause").disabled = true;
}

function populateAdminTable(tableName){//This function is used on the admin page to bring up the table of words in order for the user to add or edit them.
    let url = "/card/get/All";
    console.log("Getting file: " + url);
    fetch(url, {method: "GET"}).then( response => {
        return response.json();
    }).then (response => {
        if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
            alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert
        } else {
            refreshTable(tableName, response);
        };
    });
}

function refreshTable(tableName, response){ //once the user has finished making their edits to the table, this function refreshes the tables so they can see their changes
    removeAllRows(tableName);
    for ( let id in response){
        addTableRow(tableName, id, response[id])
    }
}
function removeAllRows(tableName) { //this function removes row from the table
    let tblObject = document.getElementById(tableName);
    // Remove any existing rows except for the title row
    tblObject.removeChild(tblObject.getElementsByTagName("tbody")[0]);
    let tblBody = document.createElement("tbody");
    tblObject.appendChild(tblBody);
}
function addTableRow(tableName, id, jsonElements){// this function is used to add rows to the table
    let tblObject = document.getElementById(tableName);
    let tblBody = tblObject.getElementsByTagName("tbody")[0];
    let tblRow = tblBody.insertRow();
    tblRow.insertCell(0).innerHTML = id;
    tblRow.insertCell(1).innerHTML = jsonElements["Person"];
    tblRow.insertCell(2).innerHTML = jsonElements["Object"];
    tblRow.insertCell(3).innerHTML = jsonElements["Random"];
    tblRow.insertCell(4).innerHTML = jsonElements["Nature"];
    tblRow.insertCell(5).innerHTML = jsonElements["World"];
    tblRow.insertCell(6).innerHTML = jsonElements["Action"];
    tblRow.insertCell(7).innerHTML = jsonElements["Spade"];
    tblRow.insertCell(8).innerHTML = '<button onClick="setEdit(event)">Edit</button>';
}

function setEdit(event){// this function is used to edit any of the rows in a table.
    let xButton = event.target;
    let xRow = xButton.parentElement.parentElement;
    document.getElementById("ePerson").value = xRow.getElementsByTagName('td')[1].innerHTML;
    document.getElementById("eObject").value = xRow.getElementsByTagName('td')[2].innerHTML;
    document.getElementById("eRandom").value = xRow.getElementsByTagName('td')[3].innerHTML;
    document.getElementById("eNature").value = xRow.getElementsByTagName('td')[4].innerHTML;
    document.getElementById("eWorld").value = xRow.getElementsByTagName('td')[5].innerHTML;
    document.getElementById("eAction").value = xRow.getElementsByTagName('td')[6].innerHTML;
    document.getElementById("eSpade").value = xRow.getElementsByTagName('td')[7].innerHTML;
    document.getElementById("eCardId").value = xRow.getElementsByTagName('td')[0].innerHTML;
}

function frmSubmit(event) { // this function allows the user the submit any changes they make to the table.
    event.preventDefault();
    let frmObject = event.target;
    let frmData = new FormData(frmObject);
    let frmTarget = frmObject.getAttribute("action");
    const result = fetch(frmTarget, {method: "POST", body:frmData}).then(response =>{
        return response.json();
    }).then( response => {
        populateAdminTable("WordList");
        alert(JSON.stringify(response));
    });
    return false;
}