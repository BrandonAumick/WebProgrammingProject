const express = require("express");
const app = express();
const hbs = require('hbs');

var myHeaders = new Headers();
myHeaders.append("x-api-key", "b79ca68003714acf8ccf1a0848a37a5b");
myHeaders.append("Content-Type", "text/plain");


async function main() {

    app.use(express.static("homepage"));
    app.use(express.urlencoded({extended: false}));
    app.set("view engine", "html");
    app.engine('html', hbs.__express);

    app.post('/', async (req, res) => {
        
        try {
            var playerInfo = await getPlayer(req.body.name1);
        } catch (err) {
            //Temporary status code to stop the browser from waiting for a response. This is not actually a successful result.
            res.status(204).send();
            return;
        }
        let playerStats = await getStats(playerInfo['memberId'], playerInfo['memberType']);

        res.render("index", {
            emblemPath1: playerStats['emblemPath'],
            playerName1: `${playerInfo['displayName']}#${playerInfo['displayCode']}`,
            lifetimeTriumph1: playerStats['lifetimeScore'], 
            activeTriumph1: playerStats['activeScore'],
            commendationScore1: playerStats['commendationScore'],
            guardianRank1: playerStats['guardianRank'],
            seasonalLevel1: playerStats['seasonalLevel'],
            timePlayed1: playerStats['timePlayed']
        });

    });

    // Start the web server
    app.listen(3000, function() {
        console.log("Listening on port 3000...");
    });
}

main();

 
 
 async function getPlayer(playerName) {
 
     let response = await fetch("https://www.bungie.net/Platform/User/Search/GlobalName/0/", {
         method: 'POST',
         headers: myHeaders,
         redirect: 'follow',
         body: `{\"displayNamePrefix\" : \"${playerName}\"}`
     });
     response = await response.json();
     if (!response["Response"]["searchResults"][0]) {
        throw 'No results';
     }

     return {
        memberId: response["Response"]["searchResults"][0]["destinyMemberships"][0]["membershipId"], 
        memberType: response["Response"]["searchResults"][0]["destinyMemberships"][0]["membershipType"], 
        displayName: response["Response"]["searchResults"][0]["bungieGlobalDisplayName"], 
        displayCode: response["Response"]["searchResults"][0]["bungieGlobalDisplayNameCode"].toString()
    };
 
 }
 
 
 async function getStats(memberId, memberType) {
 
     var requestOptions = { method: "Get", headers: myHeaders };

     let responses = [
        fetch(`https://www.bungie.net/Platform/Destiny2/${memberType}/Profile/${memberId}/?components=Records,Characters,SocialCommendations,Profiles,ProfileProgression`, requestOptions),
        fetch(`https://www.bungie.net/Platform/Destiny2/${memberType}/Account/${memberId}/Stats/?groups=1`, requestOptions)
     ];
     responses = await Promise.all(responses);
     responses = [responses[0].json(), responses[1].json()];
     responses = await Promise.all(responses);


    //Returns a dictonary of information selected from the API responses
     return {
        lifetimeScore: responses[0]["Response"]["profileRecords"]["data"]["lifetimeScore"].toString(), 
        activeScore: responses[0]["Response"]["profileRecords"]["data"]["activeScore"].toString(), 
        emblemPath: Object.values(responses[0]["Response"]["characters"]["data"])[0]["emblemPath"], 
        commendationScore: responses[0]["Response"]["profileCommendations"]["data"]["totalScore"].toString(),
        guardianRank: responses[0]["Response"]["profile"]["data"]["currentGuardianRank"].toString(),
        //Xp number divded by 100,000 to get number of progressed levels. +1 to account for starting at level 1.
        seasonalLevel: Math.floor((responses[0]["Response"]["profileProgression"]["data"]["seasonalArtifact"]["powerBonusProgression"]["currentProgress"]/100000) + 1).toString(),
        //Time divided by 3,600 to convert from seconds to hours
        timePlayed: Math.floor(responses[1]["Response"]["mergedAllCharacters"]["merged"]["allTime"]["secondsPlayed"]["basic"]["value"]/3600)
    };
 
 }
