var pairs = [

];

let answer_history = [];
let capitals = [];
var config = {
    apiKey: "AIzaSyBCb_mHdtDmueg4k0nqMYeDXiAzlmqPwBs",
    authDomain: "cs374-kkm.firebaseapp.com",
    databaseURL: "https://cs374-kkm.firebaseio.com",
    projectId: "cs374-kkm",
    storageBucket: "cs374-kkm.appspot.com",
    messagingSenderId: "757066701930"
};

function csvJSON(csv){
    var lines=csv.split("\r\n");
    var result = [];
    var headers=lines[0].split(",");
    for(var i=1;i<lines.length;i++){
        var obj = {};
        var currentline=lines[i].split(",");
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }

    return result; //JSON
}
const init = (updated_pair) =>{
    pairs = updated_pair;
    console.log(pairs)
    for (let i = 0 ; i < pairs.length; i ++){
             capitals.push(pairs[i]['capital']);
    }
    refreshQuestion();
    readFromDatabase();



}
const getPairs = async(callback) =>{
    const endpoint = 'https://s3.ap-northeast-2.amazonaws.com/ec2-54-144-69-91.compute-1.amazonaws.com/country_capital_pairs_2019.csv'
    try{
        const response = await fetch(endpoint);
        if (response.ok){
            const textResponse = await response.text();
            callback(csvJSON(textResponse))
        }
    }
    catch(error){
        console.log(error)
    }
}
getPairs(init);

firebase.initializeApp(config);

function writeToDatabase(ans_history) {
    var newKey = firebase.database().ref('/quiz');
    newKey.set({
        history: ans_history
    });
}

function readFromDatabase() {
    return firebase.database().ref('/quiz/').on('value', function(snapshot) {
        // initializeTable();

        var myValue = snapshot.val();
        answer_history = myValue.history;

        console.log(myValue);
        addAllContentsToTable();

    });
}



let country = document.getElementById("pr2_question");
let answer = document.getElementById("pr2_answer");
let submit_button = document.getElementById("pr2_submit");
let result_table = document.getElementById("result_table");

let all = document.getElementById("all");
let correct = document.getElementById("correct");
let wrong = document.getElementById("wrong");
let clear_button = document.getElementById('clear_button');
let id_count ;


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillContent(divObj, content) {
    /*
      Fill the contents of the object "divObj" with the string "content"
    */
    divObj.innerHTML = content;
    //왼쪽 테이블을 업데이트 할 때 이 함수를 사용할 것이다.
}

function chooseQuestion(){
    answer_pair = pairs[getRandomInt(0,171)];
    current_answer = answer_pair.capital;
    return answer_pair.country;
}

function refreshQuestion(){
    fillContent(country, chooseQuestion());
    answer.value = "";
}

function checkAnswer(){
    id_count =  new Date().getTime();
    if (answer.value.toUpperCase() ===answer_pair.capital.toUpperCase()){
        answer_history.push([answer_pair.country,answer.value,"correct",answer_pair.capital,id_count])
    }
    else{
        answer_history.push([answer_pair.country,answer.value,"wrong",answer_pair.capital,id_count])
    }

    writeToDatabase(answer_history)
}

function initializeTable() {
    /*
      Initialize the courses in the right plane
    */
    var myRow = result_table.rows.length;
    for (var i = 0; i < myRow - 3; i++){
        result_table.deleteRow(3);
    }
    //테이블의 두 번째 row 를 계속해서 없애는 함수이다.
}

function addAllContentsToTable(){
    for (var i = 0; i < answer_history.length; i++){
        var row = result_table.insertRow(result_table.rows.length);
        var col1 = row.insertCell(0);
        var col2 = row.insertCell(1);
        var col3 = row.insertCell(2);
        var col4 = row.insertCell(3);

        if (answer_history[i][2]==="correct"){
            col1.innerHTML = answer_history[i][0];
            col1.style.color = "green";
            col2.innerHTML = answer_history[i][1];
            col2.style.color = "green";

            col3.innerHTML = `${answer_history[i][1]}<input type = 'button' value = 'delete' onclick = 'deleteById(${answer_history[i][4]},writeToDatabase)'>`

            col3.style.color = "green";
        }
        else{
            col1.innerHTML = answer_history[i][0];
            col1.style.color = "red";
            col2.innerHTML = "<del>"+answer_history[i][1]+"<del>";
            col2.style.color = "red";
            col3.innerHTML = `${answer_history[i][3]}<input type = 'button' value = 'delete' onclick = 'deleteById(${answer_history[i][4]},writeToDatabase)'>`
            col3.style.color = "red";
        }
    }
}

function addCorrectContentsToTable(){

    for (var i = 0; i < answer_history.length; i++){
        if (answer_history[i][2]==="correct"){
            var row = result_table.insertRow(result_table.rows.length);
            var col1 = row.insertCell(0);
            var col2 = row.insertCell(1);
            var col3 = row.insertCell(2);
            var col4 = row.insertCell(3);

            col1.innerHTML = answer_history[i][0];
            col1.style.color = "green";
            col2.innerHTML = answer_history[i][1];
            col2.style.color = "green";
            col3.innerHTML =`${answer_history[i][1]}<input type = 'button' value = 'delete' onclick = 'deleteById(${answer_history[i][4]},writeToDatabase)'>`
            col3.style.color = "green";
        }
    }
}
function addWrongContentsToTable(){
    for (var i = 0; i <answer_history.length; i++){

        if (answer_history[i][2] === "wrong"){

            var row = result_table.insertRow(result_table.rows.length);
            var col1 = row.insertCell(0);
            var col2 = row.insertCell(1);
            var col3 = row.insertCell(2);
            var col4 = row.insertCell(3);
            col1.innerHTML = answer_history[i][0];
            col1.style.color = "red";
            col2.innerHTML = "<del>"+answer_history[i][1]+"<del>";
            col2.style.color = "red";
            col3.innerHTML = `${answer_history[i][3]}<input type = 'button' value = 'delete' onclick = 'deleteById(${answer_history[i][4]},writeToDatabase)'>`
            col3.style.color = "red";
        }
    }

}


function deleteById(id,callback){

    for (var i = 0 ; i < answer_history.length; i++){
        if (answer_history[i][4] === id){
            console.log("well perfoming");
            answer_history.splice(i,1);
        }
        // if(i === answer_history.length-1){
        //     writeToDatabase(answer_history)
        // }
    }

    console.log(answer_history);

    callback(answer_history); //왜 callback 이 여기에 있으면 잘 작동하는가?



    initializeTable();

    addAllContentsToTable();
    refreshQuestion();


}

function updateTable(){
    checkAnswer();
    initializeTable();

    addAllContentsToTable();
    refreshQuestion();
}

function filterTable(){
    initializeTable();
    if (all.checked){
        initializeTable();
        addAllContentsToTable()
    }
    else if (correct.checked){
        addCorrectContentsToTable()
    }
    else{
        addWrongContentsToTable()
    }
}

function clearAll(){
    answer_history = [];
    writeToDatabase(answer_history);
    initializeTable();
}

function checkEnter(event){
    if(event.keyCode == 13){
        updateTable();
    }
}
function enterkey() {
    if (window.event.keyCode == 13) {

        // 엔터키가 눌렸을 때 실행할 내용
        updateTable();


    }
}

$( document ).ready(function() {
    var country_capital_pairs = pairs
});

$(function() {
    $("#pr2_answer").autocomplete({
        source: capitals,
        select: function(event, ui) {
             if (window.event.keyCode !=13){
                console.log(ui.item.value);
                answer.value = ui.item.value;
                updateTable();
             }
            this.value="";
            return false;
        }
    });
});

submit_button.addEventListener('click',updateTable);
answer.onkeydown = enterkey;
all.addEventListener('click',filterTable);
correct.addEventListener('click',filterTable);
wrong.addEventListener('click',filterTable);
clear_button.addEventListener('click',clearAll);



