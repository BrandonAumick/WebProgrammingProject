const express = require("express");
const app = express();
const hbs = require('hbs');
const mysql = require('mysql');
const { resolve } = require("path/win32");
const util = require('util');

var myHeaders = new Headers();
myHeaders.append("x-api-key", "b79ca68003714acf8ccf1a0848a37a5b");
myHeaders.append("Content-Type", "text/plain");


async function main() {

    app.use(express.static("homepage"));
    app.use(express.urlencoded({extended: false}));
    app.set("view engine", "html");
    app.engine('html', hbs.__express);

    app.get('/', async (req, res) => {

        let renderVariables = {};

        if (typeof req.query.leaderboard !== 'undefined') {

            let db = makeDb({
                host: "localhost",
                user: "root",
                password: "&r!Xfy%te7uD#3UZ6S&C"
            });
        
            await db.query('USE destiny;');

            let board = await db.query(`SELECT playerName, ${req.query.leaderboard} FROM players ORDER BY ${req.query.leaderboard} DESC;`);

            let sendString = ""
            for (score of board) {
                sendString += `${score['playerName']}: ${score[req.query.leaderboard]}`
                if (req.query.leaderboard == 'timePlayed') {sendString += ' Hours';}
                sendString += '\n'
            }

            db.close();

            renderVariables['leaderboardInfo'] = sendString;
            renderVariables['leaderDisplay'] = 'shown';

        } else {
            renderVariables['leaderDisplay'] = 'hidden';
        }

        if (typeof req.query.player1 !== 'undefined' && typeof req.query.player2 !== 'undefined') {

            loadedInfo = await loadPlayers(req.query.player1, req.query.player2);
           
            renderVariables = Object.assign({}, renderVariables, loadedInfo);

        } else {
            renderVariables['displayInfo'] = 'hidden';
        }

        res.render("index", renderVariables);

    });


    // Start the web server
    app.listen(3000, function() {
        console.log("Listening on port 3000...");
    });
}

 
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

 async function loadPlayers(playerName1, playerName2) {
    //Tries to search for a player in the API, if one isn't found an error will occur
    try {
        getPlayerResponses = [getPlayer(playerName1), getPlayer(playerName2)];
        getPlayerResponses = await Promise.all(getPlayerResponses);
        var playerInfo1 = getPlayerResponses[0];
        var playerInfo2 = getPlayerResponses[1];
    } catch (err) {
        //Sets the info to hidden and shows the error code
        res.render("index", {
            errorMessage: "Could not find player",
            displayInfo: 'hidden',
            displayError: 'shown'
        });
        return;
    }

    //Gets the player scores/stats
    let playerStats1 = await getStats(playerInfo1['memberId'], playerInfo1['memberType']);
    let playerStats2 = await getStats(playerInfo2['memberId'], playerInfo2['memberType']);

    //Adds the player's info and stats to the database
    addToDatabase(playerInfo1, playerStats1);
    addToDatabase(playerInfo2, playerStats2);

    //Returns all the player information, hides error, shows info
    return {
        emblemPath1: playerStats1['emblemPath'],
        playerName1: `${playerInfo1['displayName']}#${playerInfo1['displayCode']}`,
        lifetimeTriumph1: playerStats1['lifetimeScore'], 
        activeTriumph1: playerStats1['activeScore'],
        commendationScore1: playerStats1['commendationScore'],
        guardianRank1: playerStats1['guardianRank'],
        seasonalLevel1: playerStats1['seasonalLevel'],
        timePlayed1: playerStats1['timePlayed'],
        emblemPath2: playerStats2['emblemPath'],
        playerName2: `${playerInfo2['displayName']}#${playerInfo2['displayCode']}`,
        lifetimeTriumph2: playerStats2['lifetimeScore'], 
        activeTriumph2: playerStats2['activeScore'],
        commendationScore2: playerStats2['commendationScore'],
        guardianRank2: playerStats2['guardianRank'],
        seasonalLevel2: playerStats2['seasonalLevel'],
        timePlayed2: playerStats2['timePlayed'],
        displayInfo: 'shown',
        displayError: 'hidden'
    };
 }


 function makeDb( config ) {

    const connection = mysql.createConnection( config );  return {
      query( sql, args ) {
        return util.promisify( connection.query )
          .call( connection, sql, args );
      },
      close() {
        return util.promisify( connection.end ).call( connection );
      }
    };

  }


 async function addToDatabase(playerInfo, playerStats) {

    let db = makeDb({
        host: "localhost",
        user: "root",
        password: "&r!Xfy%te7uD#3UZ6S&C"
    });

    await db.query('USE destiny;');

    await db.query(`DELETE FROM players WHERE playerName='${playerInfo['displayName']}'`);

    await db.query(`INSERT INTO players VALUES (
                '${playerInfo['displayName']}', 
                ${parseInt(playerStats['lifetimeScore'])}, 
                ${parseInt(playerStats['activeScore'])}, 
                ${parseInt(playerStats['commendationScore'])}, 
                ${parseInt(playerStats['seasonalLevel'])},
                ${parseInt(playerStats['timePlayed'])});`);

    db.close();

  }


main();
