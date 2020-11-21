"use strict";

function pageLoad() {
    console.log("Page is loading...");
    var wrdSection = 'catWord';
    var optSection = 'catSelector';
    var strCategory = getUrlParameter('category');
    if (strCategory == "") {
        showElement(optSection);
        hideElement(wrdSection);
    } else {
        hideElement(optSection);
        showElement(wrdSection);
        document.getElementById('frm_Category').value = strCategory;
        countdown();
        getWord();
    }
}

function showElement(name) {
    var el = document.getElementById(name);
    el.style.visibility = "visible";
    el.style.display = "block";
}

function hideElement(name) {
    var el = document.getElementById(name);
    el.style.visibility = "hidden";
    el.style.display = "none";
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
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
    const category = document.getElementById("frm_Category").value;
    const url = "/card/get/";
    fetch(url + category, {
        method: "GET",
    }).then(response => {
        return response.json();
    }).then(response => {
        if (response.hasOwnProperty("Error")) {
            alert(JSON.stringify(response));
        } else {
            document.getElementById("wordValue").value = response.Word;
        }
    });
}

//set seconds
let timeLeft = 5;
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
        hideElement("nextWord");
        document.getElementById("timePlay").disabled = true;
        document.getElementById("timePause").disabled = true;
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