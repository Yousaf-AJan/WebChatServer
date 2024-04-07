let ws;

//Function below gets all the roomCodes from the ChatServlet
//which all the clients can use to join the different ChatRooms
function fetchRooms(createRoom){
    // calling the ChatServlet to retrieve all room IDs
    let callURL= `http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet?createRoom=${createRoom}`;
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.json())
        .then(response => updateRoomList(response.rooms))
        .catch(error => console.error('Error fetching rooms:', error));
}

//This function updates the text to show the current room
function updateCurrentRoom(roomID) {
    document.getElementById("CurrentRoom").textContent = "You are currently in ChatRoom: " + roomID;
}

function enterRoom(code) {
    // create the web socket
    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/" + code);
    console.log(code);

    // parse messages received from the server and update the UI accordingly
    ws.onmessage = function(event) {
        console.log(event.data);
        let message = JSON.parse(event.data);
        console.log(message.message);
        document.getElementById("log").value += "[" + timestamp() + "] " + message.message + "\n";
    }

    // Update the current room text
    updateCurrentRoom(code);

    // Use event Listener to check if "Enter" is pressed and then sendMessage
    document.getElementById("input").addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

}

//This function updates the list each time a new room is created by a client
function updateRoomList(rooms){
    let roomsContainer = document.getElementById("rooms");
    roomsContainer.innerHTML = ""; // Clear the current room list
    rooms.forEach(function(roomID) {
        let roomLink = createRoomLink(roomID);
        roomsContainer.appendChild(roomLink);
    });
}

//This function creates the roomLink using the roomID
function createRoomLink(roomID) {
    let link = document.createElement("a");
    link.href = "ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/"+roomID;
    link.textContent = "Room " + roomID;
    link.onclick = function() {
        enterRoom(roomID);
        return false;
    };
    return link;
}

//This function handles the message.
function sendMessage(event) {
    let messageInput = document.getElementById("input");
    let message = messageInput.value.trim();
    if (message !== "") {
        let request = {"type":"chat", "msg":message};
        ws.send(JSON.stringify(request));
        messageInput.value = "";
    }
}

//Function that makes the time appear in the message
function timestamp() {
    let d = new Date(), minutes = d.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    return d.getHours() + ':' + minutes;
}

function refresh() {
    fetchRooms(false);
}

function openNav() {
    document.getElementById("mySidebar").style.width = "200px";
    document.getElementById("main").style.marginLeft = "200px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}