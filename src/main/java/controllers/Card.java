package controllers;

import org.glassfish.jersey.media.multipart.FormDataParam;
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

    private int getMaxId(){
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
        return max;
    }
    private int getMaxIdKids(){
        int max = 1;
        String query = "SELECT CardID FROM KidsCards ORDER BY CardID DESC LIMIT 1";  //means order the records in descending order of WordID and take only the first which will have the highest ID value
        try (Statement stmt = Main.db.createStatement()) {
            ResultSet rs = stmt.executeQuery(query);
            while (rs.next() == true) {
                max = rs.getInt("CardID");
            }
        } catch (SQLException e) {
            System.out.println("Database error: " + e.getMessage());
        }
        return max;
    }

    @POST
    @Path("put/Card")
    public String putCard(@FormDataParam("Person") String strPerson,
                          @FormDataParam("Object") String strObject,
                          @FormDataParam("World") String strWorld,
                          @FormDataParam("Action") String strAction,
                          @FormDataParam("Nature") String strNature,
                          @FormDataParam("Random") String strRandom,
                          @FormDataParam("Spade") String strSpade
    ){
        System.out.println("Invoked Card.putCard()");
        Boolean isError = false;
        if ( strPerson == "") {
            isError = true;
        }
        JSONObject response = new JSONObject();
        if (isError == false) {
            int nextCardId = getMaxId() + 1;
            try {
                PreparedStatement ps = Main.db.prepareStatement("insert into Cards (CardID, Person, Object, Random, Nature, Spade, Action, World) Values (?, ?, ?, ?, ?, ?, ?, ?)");
                ps.setInt(1, nextCardId);
                ps.setString(2, strPerson);
                ps.setString(3, strObject);
                ps.setString(4, strRandom);
                ps.setString(5, strNature);
                ps.setString(6, strSpade);
                ps.setString(7, strAction);
                ps.setString(8, strWorld);
                ps.execute();
                response.put("Status", "Success");
                response.put("Records Updated", ps.getUpdateCount());
                return response.toString();
            } catch (Exception e) {
                response.put("Status", "Failure");
                return response.toString();
            }
        } else {
            response.put("Status", "Failure");
            return response.toString();
        }
    }
    @POST
    @Path("update/Card")
    public String updateCard(@FormDataParam("ePerson") String strPerson,
                          @FormDataParam("eObject") String strObject,
                          @FormDataParam("eWorld") String strWorld,
                          @FormDataParam("eAction") String strAction,
                          @FormDataParam("eNature") String strNature,
                          @FormDataParam("eRandom") String strRandom,
                          @FormDataParam("eSpade") String strSpade,
                          @FormDataParam("eCardId") int intCardId
    ){
        System.out.println("Invoked Card.updateCard()");
        Boolean isError = false;
        if ( strPerson == "") {
            isError = true;
        }
        JSONObject response = new JSONObject();
        if (isError == false) {
            int nextCardId = getMaxId() + 1;
            try {
                PreparedStatement ps = Main.db.prepareStatement("update Cards set Person = ?, Object = ?, Random = ?, Nature = ?, Spade = ?, Action = ?, World = ? where CardId = ?");
                ps.setString(1, strPerson);
                ps.setString(2, strObject);
                ps.setString(3, strRandom);
                ps.setString(4, strNature);
                ps.setString(5, strSpade);
                ps.setString(6, strAction);
                ps.setString(7, strWorld);
                ps.setInt(8, intCardId);
                ps.execute();
                response.put("Status", "Success");
                response.put("Records Updated", ps.getUpdateCount());
                return response.toString();
            } catch (Exception e) {
                response.put("Status", "Failure");
                return response.toString();
            }
        } else {
            response.put("Status", "Failure");
            return response.toString();
        }
    }

    @GET
    @Path("get/All")
    public String getCards(){
        PreparedStatement ps = null;
        JSONObject response = new JSONObject();
        try {
            ps = Main.db.prepareStatement("SELECT * FROM Cards");
            ResultSet results = ps.executeQuery();
            while (results.next()){
                int id= results.getInt("CardID");
                JSONObject rec = new JSONObject();
                rec.put("Person", results.getString("Person"));
                rec.put("Object", results.getString("Object"));
                rec.put("Random", results.getString("Random"));
                rec.put("Nature", results.getString("Nature"));
                rec.put("World", results.getString("World"));
                rec.put("Action", results.getString("Action"));
                rec.put("Spade", results.getString("Spade"));
                response.put(id, rec);
            }
        }catch (Exception exception) {
            response.put("Status", "Failure");
        }
        return response.toString();
    }

    @GET
    @Path("get/Card/{CardID}")
    public String getCardById(@PathParam("CardID") int CardID){
        PreparedStatement ps = null;
        JSONObject response = new JSONObject();
        try {
            ps = Main.db.prepareStatement("SELECT * FROM Cards WHERE CardID = ?");
            ps.setInt(1, CardID);
            ResultSet results = ps.executeQuery();
            int count=0;

            while (results.next()){
                int id= results.getInt("CardID");
                response.put("Person", results.getString("Person"));
                response.put("Object", results.getString("Object"));
                response.put("Random", results.getString("Random"));
                response.put("Nature", results.getString("Nature"));
                response.put("World", results.getString("World"));
                response.put("Action", results.getString("Action"));
                response.put("Spade", results.getString("Spade"));
                count++;
            }
            if ( count == 0) {
                response.put("Status", "Failure");
            }
        }catch (Exception exception) {
            response.put("Status", "Failure");
        }
        return response.toString();
    }

    @GET
    @Path("get/Category/{Category}/{gameVersion}")
    public String getCard (@PathParam("Category") String category, @PathParam("gameVersion") String gameVersion) {
        System.out.println("Invoked Card.getCard() with Category " + category);

        // need to work out highest WordID in Words table in database
        // we'll just run the SQL and not worry about prepared statement as users can't access this code
        // as it's on the server
        int randomID = 0;
        PreparedStatement ps = null;
        try {
            switch (category){
                case "Person":
                    if(gameVersion.equals("kids")){
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxIdKids());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Person From KidsCards WHERE CardID = ?");

                    }else{
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxId());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Person From Cards WHERE CardID = ?");
                    }
                    break;
                case "World":
                    if(gameVersion.equals("kids")){
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxIdKids());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT World From KidsCards WHERE CardID = ?");

                    }else{
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxId());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT World From Cards WHERE CardID = ?");
                    }
                    break;
                case "Object":
                    if(gameVersion.equals("kids")){
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxIdKids());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Object From KidsCards WHERE CardID = ?");

                    }else{
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxId());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Object From Cards WHERE CardID = ?");
                    }
                    break;
                case "Action":
                    if(gameVersion.equals("kids")){
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxIdKids());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Action From KidsCards WHERE CardID = ?");

                    }else{
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxId());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Action From Cards WHERE CardID = ?");
                    }
                    break;
                case "Nature":
                    if(gameVersion.equals("kids")){
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxIdKids());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Nature From KidsCards WHERE CardID = ?");

                    }else{
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxId());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Nature From Cards WHERE CardID = ?");
                    }
                    break;
                case "Random":
                    if(gameVersion.equals("kids")){
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxIdKids());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Random From KidsCards WHERE CardID = ?");

                    }else{
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxId());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Random From Cards WHERE CardID = ?");
                    }
                    break;
                case "Spade":
                    if(gameVersion.equals("kids")){
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxIdKids());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Spade From KidsCards WHERE CardID = ?");

                    }else{
                        randomID = ThreadLocalRandom.current().nextInt(1, getMaxId());//generating a random ID between one and the maximum ID in the table
                        ps = Main.db.prepareStatement("SELECT Spade From Cards WHERE CardID = ?");
                    }
                    break;
            }
            ps.setInt(1, randomID); // fulfill second question mark
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
    }
}