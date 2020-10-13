package controllers;

import org.json.simple.JSONObject;
import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.concurrent.ThreadLocalRandom;

@Path("card/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class Card {
    @GET
    @Path("get/{Category}")
    public String getCard (@PathParam("Category") String category) {
        System.out.println("Invoked Card.getCard() with Category " + category);

        // need to work out highest WordID in Words table in database
        // we'll just run the SQL and not worry about prepared statement as users can't access this code
        // as it's on the server
        int max = 1;
        String query = "SELECT CardID FROM Cards ORDER BY CardID DESC LIMIT 1";  //means order the records in descending order of WordID and take only the first which will have the highest ID value
        try (Statement stmt = Main.db.createStatement()) {
            ResultSet rs = stmt.executeQuery(query);
            while (rs.next() == true) {
                max = rs.getInt("CardID");
            }
        } catch (SQLException e) {
            System.out.println("Database error: " + e.getMessage());
        }

        int randomID = ThreadLocalRandom.current().nextInt(1, max);


        try {
            PreparedStatement ps = null;
            switch (category){
                case "Person":
                    ps = Main.db.prepareStatement("SELECT Person FROM Cards WHERE CardID = ?");
                    break;
                case "World":
                    ps = Main.db.prepareStatement("SELECT World FROM Cards WHERE CardID = ?");
                    break;
                case "Object":
                    ps = Main.db.prepareStatement("SELECT Object FROM Cards WHERE CardID = ?");
                    break;
                case "Action":
                    ps = Main.db.prepareStatement("SELECT Action FROM Cards WHERE CardID = ?");
                    break;
                case "Nature":
                    ps = Main.db.prepareStatement("SELECT Nature FROM Cards WHERE CardID = ?");
                    break;
                case "Random":
                    ps = Main.db.prepareStatement("SELECT Random FROM Cards WHERE CardID = ?");
                    break;
                case "Spade":
                    ps = Main.db.prepareStatement("SELECT Spade FROM Cards WHERE CardID = ?");
                    break;
               }

            ps.setInt(1, randomID);
            ResultSet results = ps.executeQuery();
            JSONObject response = new JSONObject();
            if (results.next() == true) {
                response.put("Word", results.getString(1));
            }
            return response.toString();
        } catch (Exception exception) {
            System.out.println("Database error: " + exception.getMessage());
            return "{\"Error\": \"Unable to get item.\"}";
        }



//        try {
//            PreparedStatement ps = Main.db.prepareStatement("SELECT CardID, Person, World, Object, Action, Nature, Random, Spade FROM Cards WHERE CardID = ?");
//            ps.setInt(1, randomID);
//            ResultSet results = ps.executeQuery();
//            JSONObject response = new JSONObject();
//            if (results.next() == true) {
//                response.put("CardID", results.getString(1));
//                response.put("Person", results.getString(2));
//                response.put("World", results.getInt(3));
//                response.put("Object", results.getInt(4));
//                response.put("Action", results.getInt(5));
//                response.put("Nature", results.getInt(6));
//                response.put("Random", results.getInt(7));
//                response.put("Spade", results.getInt(8));
//            }
//            return response.toString();
//        } catch (Exception exception) {
//            System.out.println("Database error: " + exception.getMessage());
//            return "{\"Error\": \"Unable to get item.\"}";
//        }

    }


}
