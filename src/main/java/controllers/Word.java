package controllers;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import server.Main;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONObject;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.io.*;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Random;

@Path("word/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class Word {
    @GET
    @Path("get/{WordID}")
    public String getWord (@PathParam("WordID") Integer WordID){
        System.out.println("Invoked Word.getWord() with WordID " + WordID);
        int wordID = 10;
        try {
            PreparedStatement ps = Main.db.prepareStatement("SELECT WordID, Person, World, Object, Action, Nature, Random, Spade FROM Words WHERE WordID = WordID");
            ps.setInt(1, WordID);
            ResultSet results = ps.executeQuery();
            JSONObject response = new JSONObject();
            if (results.next() == true) {
                response.put("WordID", WordID);
                response.put("Person", results.getString(2));
                response.put("World", results.getInt(3));
                response.put("Object", results.getInt(4));
                response.put("Action", results.getInt(5));
                response.put("Nature", results.getInt(6));
                response.put("Random", results.getInt(7));
                response.put("Spade", results.getInt(8));
            }
            return response.toString();
        } catch (Exception exception) {
            System.out.println("Database error: " + exception.getMessage());
            return "{\"Error\": \"Unable to get item.\"}";
        }
    }
    /*public static void main(String[] args) {
        Random rd = new Random(); // creating Random object
        System.out.println(rd.nextInt());
    }*/
}
