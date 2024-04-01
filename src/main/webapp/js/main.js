//Functionality Part of Js
let ws;

function newRoom(){
    // calling the ChatServlet to retrieve a new room ID
    let callURL= "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())
        .then(response => enterRoom(response)); // enter the room with the code
}

function enterRoom(code){
    // refresh the list of rooms

    // create the web socket
    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/"+code);
    console.log(code);

    // parse messages received from the server and update the UI accordingly
    ws.onmessage = function (event) {
        console.log(event.data);
        // parsing the server's message as json
        let message = JSON.parse(event.data);
        // handle message
        document.getElementById("log").value += "[" + timestamp() + "] " + message.message + "\n";
    }

    document.getElementById("input").addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            let request = {"type":"chat", "msg":event.target.value};
            ws.send(JSON.stringify(request));
            event.target.value = "";
        }

    });

    // Add a link to the new room in the sidebar
    let roomLink = document.createElement("a");
    roomLink.href = "javascript:void(0)";
    roomLink.textContent = "Room " + code;
    roomLink.onclick = function() {
        // Handle clicking on the room link
        ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/"+code);
        // You may want to add more functionality here
    };
    document.getElementById("rooms").appendChild(roomLink);

}
function timestamp() {
    let d = new Date(), minutes = d.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    return d.getHours() + ':' + minutes;
}


//UI Part Of JS Below

function send() {
    // var inputvalue=document.getElementById('input').value;
    //document.getElementById('log').value=inputvalue;
    // ws.send(JSON.stringify(request));
}