"use strict";

function pageLoad() {
    console.log("Page is loading...");

    countdown();

//    getWord(); //<-- Not happy

}

function getWord() {
    console.log("Invoked getWord()");

    const category = document.getElementById("frm_Category").value;   //get value from date picker
    const url = "/card/get/";		// API method on webserver will be in Eaten class with @Path of list

    fetch(url + category, {        			// dateEaten as path param
        method: "GET",
    }).then(response => {
        return response.json();                 //return response to JSON
    }).then(response => {
        if (response.hasOwnProperty("Error")) { //checks if response from server has a key "Error"
            alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert
        } else {
            document.getElementById("wordValue").innerHTML = response.Word;
        }
    });
}

//set minutes
let timeLeft = 60;

//countdown function is evoked when page is loaded
function countdown() {

    let theTimer = setInterval(function() {
        timeLeft--;

        console.log(timeLeft);

        document.getElementById("minutes").innerHTML = String(Math.floor(timeLeft / 60));
        let secondsString = String(timeLeft % 60);
        document.getElementById("seconds").innerHTML = (secondsString.length == 1 ? "0" : "") + secondsString;// add the second zero, so the timer presents in standard format

        if (timeLeft < 0) {
            clearInterval(theTimer);// makes sure the timer doesn't go negative
            alert("Whooop time up!");
        }

    }, 1000);

}