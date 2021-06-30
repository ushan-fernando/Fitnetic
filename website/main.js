// Variables for BLE Connection
const serviceUuid = "b7fb8e6c-0000-4ee6-9dc8-9c45b99a0356";
let modelCharacteristic;
let myBLE;
let isConnected = false;

//Buttons
let bluetoothButton, activityButton, saveButton;

//Activity Variables
let isActivityStarted = false;
let myValue = ['0', '0'];
let whichTabShown;

//Pedometer
let stepCount = 0;
let prevStepCount = 0;
let isStepsUpdated = false;
let targetSteps, gender, height, weight;
let distance, calories;

//Sitting
let timeText, captionText;
let prevCount = 0;

//Timer
let curTime = 0;
let prevTime = 0;
let time = 0;
let sittingTime = 0;
let standingTime = 0;
let walkingTime = 0;

//Activity SUmmary
let pieChart;
let walkingSummary, sittingSummary, standingSummary;

function setup(){
    //Initialise the service worker
    if("serviceWorker" in navigator){
        navigator.serviceWorker.register("sw.js").then(registration =>{
            console.log("SW Registered!");
            console.log(registration);
        }).catch(error =>{
            console.log("SW Registration Failed");
            console.log(error);
        })
    }
    
    //If the user returns to the site from another tab or after the site was minimized,
    //load in the values from the Arduino Board and update the site. This was done to fix 
    // the problem of the site not running in background(when on another tab or minimized).
    document.addEventListener("visibilitychange", () => {
        if(isActivityStarted){
            walkingTime = myValue[2];
            standingTime = myValue[3];
            sittingTime = myValue[4];
            timeText.innerText = convertSeconds(sittingTime);
        }
    });

    //If there is data available from previous fitness session, show a popup to 
    //the user asking whether he/she wants to load the saved data or start over.
    //Then load the main content of the website.
    if(localStorage.getItem('stepCount') != null){
        whichTabShown = "savedData";
        document.getElementById('saved-data-alert').style.display = "flex";
        document.getElementById('saved-data-overlay').style.display = "block";
        
        let startOver = document.getElementById('start-over');
        let loadData = document.getElementById('load-data');

        loadData.onclick = () => {
            websiteSetup();
            document.getElementById('saved-data-alert').style.display = "none";
            document.getElementById('saved-data-overlay').style.display = "none";
        }

        startOver.onclick = () => {
            localStorage.removeItem('stepCount');
            localStorage.removeItem('walkingTime');
            localStorage.removeItem('sittingTime');
            localStorage.removeItem('standingTime');
            websiteSetup();
            document.getElementById('saved-data-alert').style.display = "none";
            document.getElementById('saved-data-overlay').style.display = "none";
        }
    }
    else{
        websiteSetup();
    }
}

function websiteSetup(){
    myBLE = new p5ble(); //Initialise Bluetooth

    const myCanvas = createCanvas(400, 200); //Create canvas for the pedometer gauge
    myCanvas.parent('progress');

    //Initialise Settings Atrributes
    targetSteps = document.getElementById('step-goal');
    gender = document.getElementById('gender');
    height = document.getElementById('height');
    weight = document.getElementById('weight');

    //If stored data available load the data
    if(localStorage.getItem('targetSteps') != null) targetSteps.value = localStorage.getItem('targetSteps');
    if(localStorage.getItem('gender') != null) gender.value = localStorage.getItem('gender');
    if(localStorage.getItem('height') != null) height.value = localStorage.getItem('height');
    if(localStorage.getItem('weight') != null) weight.value = localStorage.getItem('weight');
    
    if(localStorage.getItem('stepCount') != null) stepCount = localStorage.getItem('stepCount');
    if(localStorage.getItem('walkingTime') != null) walkingTime = localStorage.getItem('walkingTime');
    if(localStorage.getItem('sittingTime') != null) sittingTime = localStorage.getItem('sittingTime');
    if(localStorage.getItem('standingTime') != null) standingTime = localStorage.getItem('standingTime');

    //Initialise Bluetooth Connect/Disconnect button
    bluetoothButton = document.getElementById('bluetooth');
    bluetoothButton.onclick = handleBluetoothButton;

    //Initialise Settings Save button
    saveButton = document.getElementById('save-button');
    saveButton.onclick = saveUserData;

    //Initialise Activity Start/Stop button
    activityButton = document.getElementById('activity-button');
    activityButton.onclick = startActivity;

    //Initialise divs in Sitting Tracker Tab
    timeText = document.getElementById('time-data'); 
    timeText.innerText = convertSeconds(sittingTime);
    captionText = document.getElementById('caption-text');

    //Initialise divs in Activity Summary Tab
    walkingSummary = document.getElementById('walking-time-summary');
    sittingSummary = document.getElementById('sitting-time-summary');
    standingSummary = document.getElementById('standing-time-summary');

    //Initialise the pie chart in Activity Summary
    pieChartInit();

    //Open the Settings page by default when website loads
    document.getElementById("defaultOpen").click(); 
}

async function handleBluetoothButton(){
    if(!isConnected){
        await myBLE.connect(serviceUuid, gotCharacteristics);
        if(myBLE.device != null){
            isConnected = true;
            bluetoothButton.children[1].innerText = 'Disconnect';
            bluetoothButton.style.color = "turquoise";
            bluetoothButton.style.border = "2px solid turquoise"
        }
    } 
    else{
        if(isActivityStarted) startActivity();
        await myBLE.disconnect();
        myBLE.device = null;
        isConnected = false;
        bluetoothButton.children[1].innerText = 'Connect';
        bluetoothButton.style.removeProperty('color');
        bluetoothButton.style.removeProperty('border');
    }
}

function startActivity(){
    if(!isActivityStarted){
        myBLE.startNotifications(modelCharacteristic, gotValue, 'string');
        counter = 0;
        isActivityStarted = true;
        activityButton.children[1].innerText = 'Stop';
        activityButton.style.color = "turquoise";
        activityButton.style.border = "2px solid turquoise";
    }
    else{
        myBLE.stopNotifications(modelCharacteristic);
        isActivityStarted = false;
        activityButton.children[1].innerText = 'Start';
        activityButton.style.removeProperty('color');
        activityButton.style.removeProperty('border');
    }
}

function saveUserData(){
    localStorage.setItem('targetSteps', targetSteps.value);
    localStorage.setItem('gender', gender.value);
    localStorage.setItem('height', height.value);
    localStorage.setItem('weight', weight.value);
    alert("Data Saved");
}

function gotCharacteristics(error, characteristics){
    if(error) console.log('error: ', error);

    if(myBLE.device != null){
        modelCharacteristic = characteristics[0];
    }
}

function gotValue(value){
    myValue = value.split('x');
}

function convertSeconds(s) {
    let hour = floor(s / 3600);
    let min = floor(s / 60);
    let  sec = s % 60;
    return nf(hour, 2) + ':' + nf(min, 2) + ':' + nf(sec, 2);
}

function sittingData(){
    if(isActivityStarted && myValue[0] == 'sitting'){
        captionText.innerText = "You are sitting"
        timeText.innerText = convertSeconds(sittingTime);
    }
    else{
        captionText.innerText = "Take a seat to start the timer";
        prevCount = sittingTime;
    }

    //If the user sits in place for 30 minutes notify
    if(sittingTime - prevCount >= 1800){
        captionText.innerText = "You have been sitting too long!";
    }
}

function pedometerData(){
    if(isActivityStarted && myValue[0] == "walking"){
    
        if(gender == 'male'){
            //Distance = ((0.415 * height/cm * stepCount)/10^5)km
            distance = round((0.415 * height.value * myValue[1]) / 100000, 2);
            //Calories = stepCount * (0.57 * weight/lbs) / (1mile in cm/(height * 0.415))
            calories = round(myValue[1] * (0.57 * weight.value * 2.20462) / (160934 / (height.value * 0.415)));
        }
        else{
            //Distance = ((0.413 * height/cm * stepCount)/10^5)km
            distance = round((0.413 * height.value * myValue[1]) / 100000, 2);
            //Calories = stepCount * (0.57 * weight/lbs) / (1mile in cm/(height * 0.413))
            calories = round(myValue[1] * (0.57 * weight.value * 2.20462) / (160934 / (height.value * 0.413)));
        }
    
        
        document.getElementById('distance-data').innerText = 'Distace: ' + distance + 'km'
        document.getElementById('calories-data').innerText = 'Calories: ' + calories + 'kcal'
        stepCount = myValue[1];
    }
}

function drawPedometerGauge(){
    noFill();

    strokeWeight(15);
    stroke('#e5e5e5');
    arc(200, 100, 175, 175, PI- 1, TWO_PI + 1);

    strokeWeight(15);
    stroke('#1e88e5');
    arc(200, 100, 175, 175, PI- 1, stepCount/targetSteps.value * (PI + 2) + (PI - 1));

    strokeWeight(0);
    fill(255);
    textFont('Montserrat');
    textStyle(NORMAL);

    textSize(16);
    text("steps", 200, 130)

    textAlign(CENTER);
    textSize(28);
    text(stepCount, 200, 110);
}

function pieChartInit(){
    pieChart = new Chart(document.getElementById("pie-chart"), {
        type: 'pie',
        data: {
            labels: ["Walking", "Sitting", "Standing"],
            datasets: [{
                label: "Time(s)",
                backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f"],
                data: [walkingTime, sittingTime, standingTime]
            }]
        },
        options: {
            responsive: false,
            mainAspectRatio: false,
        }
    });
}

function activitySummaryData(){
    pieChart.data.datasets[0].data[0] = walkingTime;
    pieChart.data.datasets[0].data[1] = sittingTime;
    pieChart.data.datasets[0].data[2] = standingTime;

    walkingSummary.innerText = "Walking: " + convertSeconds(walkingTime);
    sittingSummary.innerText = "Sitting: " + convertSeconds(sittingTime);
    standingSummary.innerText = "Standing: " + convertSeconds(standingTime);

    pieChart.update();
}

function openTab(evt, id){
    let content, tablinks;

    content = document.getElementsByClassName("content");
    for(let i = 0; i < content.length; i++){
        content[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for(let i = 0; i < tablinks.length; i++){
        tablinks[i].className = tablinks[i].className.replace("active", "");
    }

    document.getElementById(id).style.display = "flex";
    whichTabShown = id;
    evt.currentTarget.className += " active";
}

function draw(){
    if(myBLE != null){
        if(myBLE.device == null){
            activityButton.disabled = true;
        }
        else{
            activityButton.disabled = false;
        }

        clear();
        pedometerData();
        drawPedometerGauge();
        sittingData();
        if(whichTabShown == "Activity-Summary") activitySummaryData();

        if(isActivityStarted){
            walkingTime = myValue[2];
            standingTime = myValue[3];
            sittingTime = myValue[4];
            
            localStorage.setItem('stepCount', stepCount);
            localStorage.setItem('walkingTime', walkingTime);
            localStorage.setItem('sittingTime', sittingTime);
            localStorage.setItem('standingTime', standingTime);
        }
    }
}