package com.example.webchatserver;

import java.io.*;
import java.util.HashSet;
import java.util.Set;
import org.json.JSONArray;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import org.apache.commons.lang3.RandomStringUtils;

/**
 * This is a class that has services
 * In our case, we are using this to generate unique room IDs**/
@WebServlet(name = "chatServlet", value = "/chat-servlet")
public class ChatServlet extends HttpServlet {
    private String message;

    //static so this set is unique
    public static Set<String> rooms = new HashSet<>();

    /**
     * Method generates unique room codes
     **/
    public String generatingRandomUpperAlphanumericString(int length) {
        String generatedString = RandomStringUtils.randomAlphanumeric(length).toUpperCase();
        // generating unique room code
        while (rooms.contains(generatedString)){
            generatedString = RandomStringUtils.randomAlphanumeric(length).toUpperCase();
        }
        rooms.add(generatedString);

        return generatedString;
    }

public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    //Add CORS headers
    response.setHeader("Access-Control-Allow-Origin", "http://localhost:63342");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST");

    //Get the boolean that is passed in the PathParam
    boolean createNewRoom = Boolean.parseBoolean(request.getParameter("createRoom"));

    //Use that boolean to decide whether the request is for another room
    //or to get the existing rooms for the other clients
    if (createNewRoom) {
        //Get the random roomID using the generatingRandomUpperAlphanumericString
        String roomID = generatingRandomUpperAlphanumericString(5);
        //Add the roomID to the roomsHashSet
        rooms.add(roomID);
    }

    //Make a jsonArray that will contain the roomIDs
    JSONArray jsonArray = new JSONArray();
    //Add all the roomIDs from the room HashSet to the JsonArray
    for (String room : rooms) {
        jsonArray.put(room);
    }
    // Send the JSON array as the response's content
    //The Response contains the RoomCodes which all the clients can access
    //and use to access all the different rooms
    PrintWriter out = response.getWriter();
    out.println("{\"rooms\": " + jsonArray.toString() + "}");
}


    public void destroy() {
    }
}