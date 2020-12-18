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


@Path("score/")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)

public class Score {

    private int getMaxId(){
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

    public int getScore(String strTeam, int gameID){
        PreparedStatement ps;
        try {
            ps = Main.db.prepareStatement("Select * from gameScores where gameID = ?");
            ps.setInt(1, gameID);
            ResultSet results = ps.executeQuery();
            if (results.next()) {
                if (strTeam.equals("Team1")) {
                    return results.getInt("team1Score");
                } else if ( strTeam.equals("Team2")) {
                    return results.getInt("team2Score");
                } else {
                    return 0;
                }
            }
        } catch (Exception e) {
            return 0;
        }
        return 0;
    }

    @POST
    @Path("put/newGame")
    public String putGame(){
        int nextID = getMaxId() + 1;
        PreparedStatement ps;
        JSONObject response = new JSONObject();
        try {
            ps = Main.db.prepareStatement("insert into gameScores (gameID, team1Score, team2Score) Values(?, ?, ?)");
            ps.setInt(1, nextID);
            ps.setInt(2, 0);
            ps.setInt(3, 0);
            response.put("Status", "Success");
            response.put("gameID", nextID);
        }catch (Exception e){
            response.put("Status", "Failure");
        }
        return response.toString();
    }

    @POST
    @Path("update/{gameID}/{team}/{increment}")
    public String updateScore(@FormDataParam("team") String strTeam, @FormDataParam("gameID") int gameID, @FormDataParam("increment") int increment){
        PreparedStatement ps;
        JSONObject response = new JSONObject();
        try {
            if (strTeam.equals("Team1") || strTeam.equals("Team2")){
                if (strTeam.equals("Team1")) {
                    ps = Main.db.prepareStatement("Update gameScores set team1Score = ? where gameID = ?");
                } else {
                    ps = Main.db.prepareStatement("Update gameScores set team2Score = ? where gameID = ?");
                }
                ps.setInt(1, getScore(strTeam, gameID) + increment);
                ps.setInt(2, gameID);
                ps.execute();
            }
         } catch (Exception e) {
            response.put("Status", "Failure");
            return response.toString();
        }

        response.put("Status", "Success");
        return response.toString();
    }

    @GET
    @Path("get")
    public String xx(){
        System.out.println("Reaching here");
        return ("<html></html>");
    }

    @GET
    @Path("get/{gameID}/{team}")
    public String getTeamScore(@FormDataParam("gameID") int gameID, @FormDataParam("team") String teamID) {
        System.out.println("Invoked getTeamScore");
        JSONObject response = new JSONObject();
        int score = 0;
        response.put("Score", score);
        return response.toString();
    }

}
