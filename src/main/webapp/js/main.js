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

//Function below handles the communication with the Chatroom
//Allows client to enter the room and sendMessages
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
    //Get the RoomsContainer which will contain the links to all the ChatRooms
    let roomsContainer = document.getElementById("rooms");
    //Clear the current RoomsContainer so duplicate room links do not appear
    roomsContainer.innerHTML = ""; // Clear the current room list
    //Iterate over the rooms array and append each room link to the roomsContainer
    rooms.forEach(function(roomID) {
        //Get roomLink
        let roomLink = createRoomLink(roomID);
        //Add the roomLink to the roomsContainer
        roomsContainer.appendChild(roomLink);
    });
}

//This function creates the roomLink using the roomID
function createRoomLink(roomID) {
    //Create a link
    let link = document.createElement("a");
    //Make the href of the link equal to Websocket URL
    link.href = "ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/"+roomID;
    //Make the link appear as Room with the ID attached at the end
    link.textContent = "Room " + roomID;
    //Make an onclick event handler for the link
    link.onclick = function() {
        //Enter the chatRoom using the enterRoom function
        enterRoom(roomID);
        return false;
    };
    return link;
}

//This function gets the message from the input
//and sends the message to sendMessageToServer function
function sendMessage(event) {
    //Get the message from the input container
    let messageInput = document.getElementById("input");
    //Remove any leading or trailing spaces
    let message = messageInput.value.trim();
    if (message !== "") {
        let request = {"type":"chat", "msg":message};
        sendMessageToServer(request, () => {
            messageInput.value = "";
        });
    }
}

//Function below sends the message to the server
//A callback is used to clear the input after the message has been sent
function sendMessageToServer(request, callback) {
    ws.send(JSON.stringify(request));
    if (callback) {
        callback();
    }
}

//Function that makes the time appear in the message
function timestamp() {
    let d = new Date(), minutes = d.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    return d.getHours() + ':' + minutes;
}

//Function below is called by the refresh button so that other
//clients can get the currently active rooms
function refresh() {
    //Call the fetchRooms function with the PathParam
    //for ChatServlet being false
    fetchRooms(false);
}

//Function below opens the Navbar
function openNav() {
    document.getElementById("mySidebar").style.width = "200px";
    document.getElementById("main").style.marginLeft = "200px";
}

//Function below opens the Navbar
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}