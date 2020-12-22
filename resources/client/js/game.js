"use strict";
let team1Marker='<span class="sqrBig">&#9822</span>';
let team2Marker='<span class="sqrBig">&#9820</span>';
let categories = ["Object", "Nature", "Person", "Action", "Spade", "Random", "World"];
let gameVersion="";
let turnScore = -1;
let gamePlay = "";
let gameID = "";

function pageLoad() {
    /*
     This function is called during page load of game.html.
     It is used to to load the page according to the version of the game picked - Original vs. Kids
     It also establishes the gameID
     */
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
                return response.json();
            }).then(response => {
                if (response.hasOwnProperty("Error")) {
                    alert(JSON.stringify(response));
                } else {
                    gamePlay = response.gamePlay;
                    refreshBoard(response.team1Score, response.team2Score, response.gamePlay);
                }
            });
    }
}

function refreshBoard(t1Score, t2Score, gPlay){
    /*
     This function is called in multiple places to refresh the game board
     It is used to do the following things:
      - it updates scores in the right hand sideColumn
      - it updates position of the game markers according the scores of each team
      - it determines the category of words for the next round.
     */
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

function updateMarkers(t1Score, t2Score) {
    /*
     This function is called by refreshBoard
     It is used to update the position of the markers after each round.
     The current/ previous marker position of team1 and team2 isn't kept track of on the server side.
     So it is easier to clear the board and remove markers drawn in any position before updating
     */
    clearAllSquares();
    drawMarkers(t1Score, t2Score);
}

function clearAllSquares(){
    for (let id=0; id<=56; id++){
        let el = "sqr"+id;
        document.getElementById(el).innerHTML = "";
    }
}

function drawMarkers(t1Score, t2Score) {
    /*
     This function is also called by refreshBoard.
     When the scores are the same for both teams, the standard marker code will position the makers
     vertically adjacent to each other.
     To avoid this we recognise that specific condition and draw the markers slightly differently.
     */
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

function updateScores(t1Score, t2Score) {
    /*
    This function is called when the scores need to be updated at the end of each round
     */
    document.getElementById("t1Score").innerHTML = team1Marker + " " + t1Score;
    document.getElementById("t2Score").innerHTML = team2Marker + " " + t2Score;
}

function gameRedirect(newURL){
    /*
    this function is used to either redirect the user back to the home page if there is an error
    or direct them to the page where they can play the game
     */
    window.location.replace(newURL);
}


function getUrlParameter(name) {
    /*
    this function is for the javascript to be able to read the parameters in the URL.
    Since this is a commonly used function in JavaScript, I borrowed it from an online source.
     */
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getContent(url, dstElement, active="Home") {
    /*
    This function is used to include the contents of the topnav.html file in all of the other pages.
    To include topnav.html in any page we call this function from an inline script statement
    This statement passes the id of the element whose content the function replaces.
     */
    console.log("Getting file: " + url);
    fetch(url, {method: "GET"}).then( response => {
        return response.text();
    }).then (response => {
        document.getElementById(dstElement).innerHTML = response;
        document.getElementById("topnav" + active).classList.add("active");
    });
}

function getWord() {
    /*
    This function is called to get words from the database based on the category.
    The API call is to GET from /card/get/Category/<categoryname>/<gameversion>
    We get the category name from an element with an ID of frm_category
    We get the game version from a URL parameter wrapped by getWordWrapper.
     */
    console.log("Invoked getWord()");
    const category = document.getElementById("frm_Category").value;   //get value from Category
    const url = "/card/get/Category/";		        // API method on webserver will be in card class with @Path of category
    fetch(url + category + "/original", {        			// Category as path param
        method: "GET",
    }).then(response => {
        return response.json();             //return response to JSON
    }).then(response => {
        if (response.hasOwnProperty("Error")) {
            alert(JSON.stringify(response));
        } else {
            document.getElementById("wordValue").value = response.Word;
        }
    });
}
function getWordKids() {
    /*
    This function is called to get words from the database based on the category.
    The API call is to GET from /card/get/Category/<categoryname>/<gameversion>
    We get the category name from an element with an ID of frm_category
    We get the game version from a URL parameter wrapped by getWordWrapper.
     */
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
function getWordWrapper(){
    /*
    this function is used to make sure that the correct table of words is used depending on the gameVersion.
     */
    console.log("Invoked Wrapper");
    let strGameVersion = getUrlParameter('gameVersion');
    if(strGameVersion == 'kids'){
        getWordKids();
    }else{
        getWord();
    }
    turnScore = turnScore + 1;
}

function startPlayerTurn(){
    /*
    this function is used at the start of each team's turn.
    In this function the countdown and getWordWrapper functions are called.
     */
    countdown();
    getWordWrapper();
    document.getElementById("playerTurn").disabled = true;
}

//set seconds
let timeLeft = 60;
let theTimer = null;

function refreshTimer(){
    /*
    this function is called every 1000 milliseconds by countdown.
    Each teams turn is assumed to be 60 seconds
    If 60 seconds have not passed the function simply updates the screen
    with the number of seconds left and exits.
    If there is no more time left, the function disabled the appropriate buttons
    so the turn can't continue and then updates the current score in the database.
     */
    timeLeft--;
    let secondsString = String(timeLeft % 60);
    document.getElementById("seconds").innerHTML = (secondsString.length == 1 ? "0" : "") + secondsString;
    if (timeLeft < 0) {
        console.log("timeLeft Magically reduced");
        clearInterval(theTimer);// makes sure the timer doesn't go negative
        //alert("Whooops time up!");
        document.getElementById("seconds").innerHTML = "00";
        document.getElementById("nextWord").disabled = true;
        document.getElementById("timePlay").disabled = true;
        document.getElementById("timePause").disabled = true;
        let url = "/score/update";
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

function countdown() {
    /*
    This function is invoked on each team's turn
    it uses refreshTimer as the callback function for setInterval
     */
    theTimer = setInterval(refreshTimer, 1000);
    document.getElementById("timePlay").disabled = true;
    document.getElementById("timePause").disabled = false;
}

function stopcountdown() {
    /*
    This function is used to include the pause game functionality.
    It is mostly for ease of use.
     */
    clearInterval(theTimer);
    document.getElementById("timePlay").disabled = false;
    document.getElementById("timePause").disabled = true;
}

function populateAdminTable(tableName){
    /*
    This function is used in admin.html to bring up the table of words in order
    for the user to add to the records or edit them.
     */
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

function refreshTable(tableName, response){
    /*
    once the user has finished making their edits to the table, this function refreshes the tables
    so they can see their changes
     */
    removeAllRows(tableName);
    for ( let id in response){
        addTableRow(tableName, id, response[id])
    }
}
function removeAllRows(tableName) {
    /*
    this function removes row from the table
     */
    let tblObject = document.getElementById(tableName);
    // Remove any existing rows except for the title row
    tblObject.removeChild(tblObject.getElementsByTagName("tbody")[0]);
    let tblBody = document.createElement("tbody");
    tblObject.appendChild(tblBody);
}
function addTableRow(tableName, id, jsonElements){
    /*
    this function is used to add rows to the table
     */
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

function setEdit(event){
    /*
    this function is used to edit any of the rows in a table.
     */
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

function frmSubmit(event) {
    /*
    this function allows the user the submit any changes they make to the table.
     */
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
