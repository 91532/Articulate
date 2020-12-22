package controllers;

import org.glassfish.jersey.media.multipart.FormDataParam;
import org.json.simple.JSONObject;
import org.json.simple.parser.*;

import server.Main;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;


@Path("score/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class Score {
    private int getMaxId(){
        /*
        This method identifies the max value of cardID in the database
        It is used to set the upper limit for the random function
        */
        int max = 1;
        String query = "SELECT gameID FROM gameScores ORDER BY gameID DESC LIMIT 1";  //means order the records in descending order of WordID and take only the first which will have the highest ID value
        try (Statement stmt = Main.db.createStatement()) {
            ResultSet rs = stmt.executeQuery(query);
            while (rs.next() == true) {
                max = rs.getInt("gameID");
            }
        } catch (SQLException e) {
            System.out.println("Database error: " + e.getMessage());
        }
        return max;
    }

    @POST
    @Path("update")
        /*
        This method is used in game.html.
        It is used to update the scores in the database at the end of each round.
        */
    public String updateScore(@FormDataParam("gameID") int gameID, @FormDataParam("teamName") String strTeam,
                              @FormDataParam("turnScore") int turnScore){
        String strData;
        strData = getGameStats(gameID);
        JSONObject data = new JSONObject();
        JSONObject response = new JSONObject();
        JSONParser parser = new JSONParser();
        try {
            data = (JSONObject) parser.parse(strData);
        } catch (Exception e) {
            response.put("Error", "Failure");
            return response.toString();
        }
        PreparedStatement ps;
        Long t1Score = (Long) data.get("team1Score");
        Long t2Score = (Long) data.get("team2Score");
        String nextPlay = "";
        if ( strTeam.equals("Team1")) {
            t1Score = t1Score + turnScore;
            nextPlay = "Team2";
        }
        if ( strTeam.equals("Team2")) {
            t2Score = t2Score + turnScore;
            nextPlay = "Team1";
        }
        try {
            ps = Main.db.prepareStatement("update gameScores set team1Score=?, team2Score=?, gamePlay=? where gameID=?");
            ps.setLong(1, t1Score);
            ps.setLong(2, t2Score);
            ps.setString(3, nextPlay);
            ps.setInt(4, gameID);
            ps.execute();
            response.put("Status", "Success");
        } catch (Exception e){
            response.put("Error", "Failure");
        }
        return response.toString();
    }

    @POST
    @Path("put/newGame")
    public String putGame(){
        /*
        This method is used in game.html.
        It is used to add a new game as a record in the database.
        */
        int nextID = getMaxId() + 1;
        PreparedStatement ps;
        JSONObject response = new JSONObject();
        try {
            ps = Main.db.prepareStatement("insert into gameScores (gameID, team1Score, team2Score, gamePlay) Values(?, ?, ?, ?)");
            ps.setInt(1, nextID);
            ps.setInt(2, 0);
            ps.setInt(3, 0);
            ps.setString(4, "Team1");
            ps.execute();
            response.put("Status", "Success");
            response.put("gameID", nextID);
        }catch (Exception e){
            System.out.println(e.toString());
            response.put("Error", "Failure");
        }
        return response.toString();
    }

    @GET
    @Path("get/{gameID}")
        /*
        This method is used in game.html.
        It is used to select an existing game from the database depending on the gameID.
        Once this is selected the user will be able to play from where they left off.
        */
    public String getGameStats(@PathParam("gameID") int gameID) {
        System.out.println("Invoked getTeamScore");
        int score = 0;
        JSONObject response = new JSONObject();
        PreparedStatement ps;
        try {
            ps = Main.db.prepareStatement("Select * from gameScores where gameID = ?");
            ps.setInt(1, gameID);
            ResultSet results = ps.executeQuery();
            if (results.next()) {
                response.put("team1Score", results.getInt("team1Score"));
                response.put("team2Score", results.getInt("team2Score"));
                response.put("gamePlay", results.getString("gamePlay"));
                response.put("Status", "Success");
            }
        } catch (Exception e) {
            response.put("Error", "Failure");
        }
        return response.toString();
    }

}