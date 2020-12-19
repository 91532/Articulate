"use strict";
let team1Marker='<span class="sqrBig">&#9822</span>';
let team2Marker='<span class="sqrBig">&#9820</span>';
let categories = ["Object", "Nature", "Person", "Action", "Spade", "Random", "World"];
let gameVersion="";
let turnScore = -1;
let gamePlay = "";
let gameID = "";

function pageLoad() {
    console.log("Page is loading...");
    gameVersion = getUrlParameter("gameVersion");
    gameID = getUrlParameter("gameID");
    if (gameID <= 0) {
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
    if (gameID > 0){
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

function refreshBoard(t1Score, t2Score, gPlay){
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
    document.getElementById("t1Score").innerHTML = team1Marker + " " + t1Score;
    document.getElementById("t2Score").innerHTML = team2Marker + " " + t2Score;
}

function gameRedirect(newURL){
    window.location.replace(newURL);
}

function showElement(name) {
    let el = document.getElementById(name);
    el.style.visibility = "visible";
    el.style.display = "block";
}

function hideElement(name) {
    let el = document.getElementById(name);
    el.style.visibility = "hidden";
    el.style.display = "none";
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function getContent(url, dstElement, active="Home") {
    console.log("Getting file: " + url);
    fetch(url, {method: "GET"}).then( response => {
        return response.text();
    }).then (response => {
        document.getElementById(dstElement).innerHTML = response;
        document.getElementById("topnav" + active).classList.add("active");
    });
}

function getWord() {
    console.log("Invoked getWord()");
    const category = document.getElementById("frm_Category").value;   //get value from date picker
    const url = "/card/get/Category/";		        // API method on webserver will be in Eaten class with @Path of list
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
function getWordKids() {
    console.log("Invoked getWordKids()");
    const category = document.getElementById("frm_Category").value;   //get value from date picker
    const url = "/card/get/Category/";		        // API method on webserver will be in Eaten class with @Path of list
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
    countdown();
    getWordWrapper();
    document.getElementById("playerTurn").disabled = true;
}

//set seconds
let timeLeft = 10;
let theTimer = null;

function refreshTimer(){
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

//countdown function is evoked when page is loaded
function countdown() {
    theTimer = setInterval(refreshTimer, 1000);
    document.getElementById("timePlay").disabled = true;
    document.getElementById("timePause").disabled = false;
}

function stopcountdown() {
    clearInterval(theTimer);
    document.getElementById("timePlay").disabled = false;
    document.getElementById("timePause").disabled = true;
}

function populateAdminTable(tableName){
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
    removeAllRows(tableName);
    for ( let id in response){
        addTableRow(tableName, id, response[id])
    }
}
function removeAllRows(tableName) {
    let tblObject = document.getElementById(tableName);
    // Remove any existing rows except for the title row
    tblObject.removeChild(tblObject.getElementsByTagName("tbody")[0]);
    let tblBody = document.createElement("tbody");
    tblObject.appendChild(tblBody);
}
function addTableRow(tableName, id, jsonElements){
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