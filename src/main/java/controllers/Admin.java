package controllers;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONObject;
import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;
import javax.xml.bind.DatatypeConverter;
import java.security.MessageDigest;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.UUID;


@Path("admin/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class Admin {

    private String hashPass(String password){
        String hash;
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(password.getBytes());
            byte[] digest = md.digest();
            hash = DatatypeConverter
                    .printHexBinary(digest).toUpperCase();
            return hash;
        } catch (Exception e){
            return null;
        }
    }

    private Boolean validatePassword(String username, String password){
        PreparedStatement ps;
        try {
            ps = Main.db.prepareStatement("SELECT password FROM users where username = ?");
            ps.setString(1, username);
            ResultSet results = ps.executeQuery();
            while (results.next()){
                String pwHashInput = hashPass(password);
                String pwHashDB = results.getString("password");
                if (pwHashInput.equals(pwHashDB)){
                    return true;
                }
            }
        }catch (Exception exception) {
            return false;
        }
        return false;
    }

    private Boolean validateToken(String username, String token){
        PreparedStatement ps;
        try {
            ps = Main.db.prepareStatement("SELECT tokenID FROM tokens where tokenID = ? and username = ? and Authenticated > 0");
            ps.setString(1, token);
            ps.setString(2, username);
            ResultSet results = ps.executeQuery();
            if (results.next()){
                return true;
            }
        }catch (Exception exception) {
            return false;
        }
        return false;
    }

    private Boolean updateToken(String username, String token, int status){
        Boolean response=false;
        try {
            PreparedStatement ps = Main.db.prepareStatement("delete from tokens where username=?");
            ps.setString(1, username);
            ps.execute();

            ps = Main.db.prepareStatement("insert into tokens (tokenID, username, Authenticated) values (?, ?, ?)");
            ps.setString(1, token);
            ps.setString(2, username);
            ps.setInt(3, status);
            ps.execute();

            response=true;
        } catch(Exception e) {
            System.out.println(e.getMessage());
            response=false;
        }
        return response;
    }

    private JSONObject setPassword(String username,
                                   String curPass,
                                   String newPass1,
                                   String newPass2){
        JSONObject response = new JSONObject();
        if (! newPass1.equals(newPass2)){
            response.put("Error", "The input passwords do not Match");
            return response;
        }
        if ( ! validatePassword(username, curPass)) {
            response.put("Error", "Authentication Error");
            return response;
        }
        try {
            PreparedStatement ps = Main.db.prepareStatement("update users set password=? WHERE username=?");
            String hash = hashPass(newPass1);
            if (hash != null) {
                ps.setString(1, hash);
                ps.setString(2, username);
                ps.execute();
                response.put("Status", "Success");
            } else {
                response.put("Error", "Failed to update User Password");
            }
            return response;
        } catch(Exception e) {
            response.put("Error", "Failed to update User Password");
            return response;
        }
    }

    @POST
    @Path("setUserPass")
    public String setUserPassword(@FormDataParam("username") String username,
                                  @FormDataParam("curPass") String curPass,
                                  @FormDataParam("newPass1") String newPass1,
                                  @FormDataParam("newPass2") String newPass2,
                                  @CookieParam("TokenID") String tokenId){
        JSONObject response = new JSONObject();
        if (! validateToken(username, tokenId)) {
            response.put("Error", "Not Authenticated");
            return response.toString();
        }
        response = setPassword(username, curPass, newPass1, newPass2);
        return response.toString();
    }

    @POST
    @Path("setAdminPass")
    public String setAdminPassword(@FormDataParam("curPass") String curPass,
                                   @FormDataParam("newPass1") String newPass1,
                                   @FormDataParam("newPass2") String newPass2,
                                   @CookieParam("TokenID") String tokenId){
        JSONObject response = new JSONObject();
        if (! validateToken("admin", tokenId)) {
            response.put("Error", "Not Authenticated");
            return response.toString();
        }
        response = setPassword("admin", curPass, newPass1, newPass2);
        return response.toString();
    }

    @GET
    @Path("checkAdminLogin")
    public String checkAdminLogin(@CookieParam("TokenID") String TokenId){
        JSONObject response = new JSONObject();
        if (! validateToken("admin", TokenId)) {
            response.put("Error", "Not Authenticated");
            return response.toString();
        }
        response.put("Status", "Success");
        return response.toString();
    }

    @POST
    @Path("login")
    public Response performLogin(@FormDataParam("username") String username,
                                 @FormDataParam("curPass") String curPass) {
        JSONObject jsr = new JSONObject();
        Response response;
        String tokenID = UUID.randomUUID().toString();
        NewCookie ck = new NewCookie("TokenID", tokenID);
        if (validatePassword(username, curPass)) {
            if (updateToken(username, tokenID, 1)) {
                jsr.put("Status", "Login Success");
            } else {
                jsr.put("Error", "Login Failed");
            }
        } else {
            jsr.put("Error", "Login Failed");
        }
        response = Response.ok(jsr.toString()).cookie(ck).build();
        return response;
    }

    private int getMaxId(String gameLevel){
        int max = 0;
        //Based on the gameLevel, get the MaxID from the appropriate Table
        //This adaptation is to re-use the code rather than create another function
        //for the kids table
        String tblName="Cards";
        if (gameLevel.equals("kids")) {
            tblName="kidsCards";
        }
        String query = "SELECT CardID FROM " + tblName + " ORDER BY CardID DESC LIMIT 1";  //means order the records in descending order of WordID and take only the first which will have the highest ID value
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

    private JSONObject newRecord(String strPerson,
                                 String strObject,
                                 String strRandom,
                                 String strNature,
                                 String strWorld,
                                 String strAction,
                                 String strSpade,
                                 String gameLevel){
        JSONObject response = new JSONObject();
        String tblName="Cards";
        if (gameLevel.equals("kids")) {
            tblName="kidsCards";
        }
        try {
            int nextCardId = getMaxId(gameLevel) + 1;
            PreparedStatement ps = Main.db.prepareStatement("insert into "+tblName+" (CardID, Person, Object, Random, Nature, Spade, Action, World) Values (?, ?, ?, ?, ?, ?, ?, ?)");
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
        } catch(Exception e) {
            response.put("Status", "Failure");
        }
        return response;
    }
    private JSONObject editRecord(String strPerson,
                                  String strObject,
                                  String strRandom,
                                  String strNature,
                                  String strWorld,
                                  String strAction,
                                  String strSpade,
                                  int intCardID,
                                  String gameLevel){
        JSONObject response = new JSONObject();
        String tblName="Cards";
        if (gameLevel.equals("kids")) {
            tblName="kidsCards";
        }
        try {
            PreparedStatement ps = Main.db.prepareStatement("update "+tblName+" set Person=?, Object=?, Random=?, Nature=?, Spade=?, Action=?, World=? WHERE CardID=?");
            ps.setString(1, strPerson);
            ps.setString(2, strObject);
            ps.setString(3, strRandom);
            ps.setString(4, strNature);
            ps.setString(5, strSpade);
            ps.setString(6, strAction);
            ps.setString(7, strWorld);
            ps.setInt(8,intCardID);
            ps.execute();
            response.put("Status", "Success");
            response.put("Records Updated", ps.getUpdateCount());
        } catch(Exception e) {
            response.put("Status", "Failure");
        }
        return response;
    }

    @POST
    @Path("put/wordRecord")
    public String splitter(@FormDataParam("ePerson") String strPerson,
                           @FormDataParam("eObject") String strObject,
                           @FormDataParam("eRandom") String strRandom,
                           @FormDataParam("eNature") String strNature,
                           @FormDataParam("eWorld") String strWorld,
                           @FormDataParam("eAction") String strAction,
                           @FormDataParam("eSpade") String strSpade,
                           @FormDataParam("eCardId") int intCardID,
                           @FormDataParam("gameLevel") String gameLevel,
                           @CookieParam("TokenID") String tokenId
    ) {
        JSONObject response = new JSONObject();
        if (! validateToken("admin", tokenId)){
            response.put("Error", "Not Authenticated");
            return response.toString();
        }
        if (strPerson.equals("") || strObject.equals("") || strRandom.equals("") || strNature.equals("") || strWorld.equals("") || strAction.equals("") || strSpade.equals("")) {
            response.put("Error", "Input Failure");
            return response.toString();
        }
        System.out.println(intCardID);
        if (intCardID == 0) {
            response = newRecord(strPerson, strObject, strRandom, strNature, strWorld, strAction, strSpade, gameLevel);
        } else {
            response = editRecord(strPerson, strObject, strRandom, strNature, strWorld, strAction, strSpade, intCardID, gameLevel);
        }
        return response.toString();
    }

    @GET
    @Path("getAll/{gameLevel}")
    public String getAllCards(@PathParam("gameLevel") String gameLevel, @CookieParam("TokenID") String tokenId){
        JSONObject response = new JSONObject();
        if (! validateToken("admin", tokenId)){
            response.put("Error", "Not Authenticated");
            return response.toString();
        }
        PreparedStatement ps = null;
        String tblName="Cards";
        if (gameLevel.equals("kids")) {
            tblName="kidsCards";
        }
        try {
            ps = Main.db.prepareStatement("SELECT * FROM " + tblName);
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
}