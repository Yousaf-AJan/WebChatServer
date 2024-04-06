package com.example.webchatserver;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * This class represents a web socket server, a new connection is created and it receives a roomID as a parameter
 * **/
@ServerEndpoint(value="/ws/{roomID}")
public class ChatServer {

    private Map<String, String> usernames = new HashMap<>();
    private static Map<String, String> roomList = new HashMap<>();
    private Map<String, ChatRoom> chatRooms = new HashMap<>();

    @OnOpen
    public void open(@PathParam("roomID") String roomID, Session session) throws IOException, EncodeException {
        session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Welcome to the chat room. Please state your username to begin.\"}");
        roomList.put(session.getId(), roomID);

        // Check if the room exists, if not, create a new room
        if (!chatRooms.containsKey(roomID)) {
            String userID = session.getId();
            chatRooms.put(roomID, new ChatRoom(roomID, userID));

        }
    }

    @OnClose
    public void close(Session session) throws IOException, EncodeException {
        String userId = session.getId();
        // do things for when the connection closes
        if (usernames.containsKey(userId)) {
            String username = usernames.get(userId);
            usernames.remove(userId);
            String roomId = roomList.get(userId);
            ChatRoom chatRoom = chatRooms.get(roomList.get(userId));
            chatRoom.removeUser(userId);
            //broadcast this person left the server
            for (Session peer : session.getOpenSessions()) {
                if ((!peer.getId().equals(userId)) && (roomList.get(peer.getId()).equals(roomId))){
                    peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): " + username + " left the chat room.\"}");
                }
            }
        }
    }

    @OnMessage
    public void handleMessage(String comm, Session session) throws IOException, EncodeException {
        // example getting unique userID that sent this message
        String userID = session.getId();
        JSONObject jsonmsg = new JSONObject(comm);
        String type = (String) jsonmsg.get("type");
        String message = (String) jsonmsg.get("msg");

        // handle the messages
        if (usernames.containsKey(userID)) {
            String username = usernames.get(userID);
            System.out.println(username);
            String roomId = roomList.get(userID);
            for (Session peer : session.getOpenSessions()) {
                if(roomList.get(peer.getId()).equals(roomId)){
                    peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(" + username + "): " + message + "\"}");
                }
            }
        } else { //first message is their username
            usernames.put(userID, message);
            session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Welcome, " + message + "!\"}");
            //broadcast this person joined the server to the rest
            String username = usernames.get(userID);
            System.out.println(username);
            String roomId = roomList.get(userID);
            for (Session peer : session.getOpenSessions()) {
                if ((!peer.getId().equals(userID)) && (roomList.get(peer.getId()).equals(roomId))) {
                    peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): " + message + " joined the chat room.\"}");
                }
            }
        }

    }
}
