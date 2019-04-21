var pairs = [

];

let answer_history = [];
let capitals = [];
let last_action = [];
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
        history: ans_history,
        undo_history : last_action
    });
}

function readFromDatabase() {
    return firebase.database().ref('/quiz/').on('value', function(snapshot) {
        // initializeTable();

        var myValue = snapshot.val();
        answer_history = myValue.history;
        last_action = myValue.undo_history;

        if(last_action !=[]){
            undo_button.disabled = false;
        }

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
let clear_button = document.getElementById('pr3_clear');
let google_map = document.getElementById('map');
let undo_button = document.getElementById('pr3_undo');
let reset_button = document.getElementById('pr3_reset');
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
    let current_country = chooseQuestion();
    fillContent(country,current_country);
    answer.value = "";
    google_map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBO_WwFts0d4UEd2BBjxoBTTqLHvi0FyqA&q=${current_country}&maptype=roadmap&language=en`

}

function checkAnswer(){
    id_count =  new Date().getTime();
    if (answer.value.toUpperCase() ===answer_pair.capital.toUpperCase()){
        answer_history.push([answer_pair.country,answer.value,"correct",answer_pair.capital,id_count])
        last_action = ['see_answer',[answer_pair.country,answer.value,"correct",answer_pair.capital,id_count]]
    }
    else{
        answer_history.push([answer_pair.country,answer.value,"wrong",answer_pair.capital,id_count])
        last_action = ['see_answer',[answer_pair.country,answer.value,"wrong",answer_pair.capital,id_count]]
    }
    undo_button.disabled = false;


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
            last_action = ['delete',answer_history[i]]
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
    //refreshQuestion();
    undo_button.disabled = false;


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
    last_action = ['clear',answer_history];
    answer_history = [];

    writeToDatabase(answer_history);
    initializeTable();
    undo_button.disabled = false;
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
function pressUndo(){
    if (last_action[0] ==='see_answer'){
        console.log('undo pressed when previous is see_answer')

        deleteById(last_action[1][4],writeToDatabase);

        last_action = ["delete",last_action[1]]

    }
    else if(last_action[0] === 'clear'){

        console.log('undo pressed when previous is clear')

        answer_history = last_action[1];

        writeToDatabase(answer_history);
        initializeTable();
        addAllContentsToTable();

        last_action = ["addAll",null]

    }
    else if(last_action[0]==='delete'){
        console.log('undo pressed when previous is delete')

        answer_history.push(last_action[1]);
        last_action = ['see_answer',last_action[1]]
        writeToDatabase(answer_history);
        initializeTable();
        addAllContentsToTable();

    }
    else {//
        console.log('undo pressed when previous is clear')
        last_action = ['clear',answer_history]
        clearAll();


    }
}

function pressReset(){
    answer_history = [];
    last_action = [];
    initializeTable();
    writeToDatabase(answer_history);
    undo_button.disabled = true;

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
undo_button.addEventListener('click',pressUndo);
reset_button.addEventListener('click',pressReset);

// $(document).on({
//     mouseenter: function() {
//         // var that = this;
//         // timer = setTimeout(function(){
//         //     google_map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBO_WwFts0d4UEd2BBjxoBTTqLHvi0FyqA&q=${that.innerText}&maptype=roadmap&language=en`
//         // }, 1000);
//         console.log('hover')
//
//     },
//     mouseleave: function() {
//         // google_map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBO_WwFts0d4UEd2BBjxoBTTqLHvi0FyqA&q=${country.innerText}&maptype=roadmap&language=en`
//         // clearTimeout(timer);
//         console.log('leave')
//     }
// }, "td");​
// var timer;
// $( "td" ).hover(
//     function() {
//
//         var that = this;
//         console.log(that.innerText)
//         timer = setTimeout(function(){
//         google_map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBO_WwFts0d4UEd2BBjxoBTTqLHvi0FyqA&q=${that.innerText}&maptype=roadmap&language=en`
//          }, 1000);
//     }, function() {
//         console.log(country.innerText)
//         google_map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBO_WwFts0d4UEd2BBjxoBTTqLHvi0FyqA&q=${country.innerText}&maptype=roadmap&language=en`
//         clearTimeout(timer);
//     }
// );
// var timer;
// $("td").mouseenter(function() {
//     var that = this;
//     console.log('hover')
//     timer = setTimeout(function(){
//         google_map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBO_WwFts0d4UEd2BBjxoBTTqLHvi0FyqA&q=${that.innerText}&maptype=roadmap&language=en`
//     }, 1000);
// }).mouseleave(function() {
//     console.log('leave')
//     google_map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBO_WwFts0d4UEd2BBjxoBTTqLHvi0FyqA&q=${country.innerText}&maptype=roadmap&language=en`
//     clearTimeout(timer);
// });



