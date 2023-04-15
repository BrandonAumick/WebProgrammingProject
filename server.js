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
        let triumphScores = await getTriumph(playerInfo['memberId'], playerInfo['memberType']);

        res.render("index", {
            playerName1: `${playerInfo['displayName']}#${playerInfo['displayCode']}`,
            LTriumph: triumphScores['lifetimeScore'], 
            ATriumph: triumphScores['activeScore'],
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

     var memberId = response["Response"]["searchResults"][0]["destinyMemberships"][0]["membershipId"];
     var memberType = response["Response"]["searchResults"][0]["destinyMemberships"][0]["membershipType"];
     var displayName = response["Response"]["searchResults"][0]["bungieGlobalDisplayName"];
     var displayCode = response["Response"]["searchResults"][0]["bungieGlobalDisplayNameCode"].toString();

     return {memberId: memberId, memberType: memberType, displayName: displayName, displayCode: displayCode};
 
 }
 
 
 async function getTriumph(memberId, memberType) {
 
     var requestOptions = { method: "Get", headers: myHeaders };
     let response = await fetch(`https://www.bungie.net/Platform/Destiny2/${memberType}/Profile/${memberId}/?components=Records`, requestOptions);
     response = await response.json();
     let lifetimeScore = response["Response"]["profileRecords"]["data"]["lifetimeScore"].toString();
     let activeScore = response["Response"]["profileRecords"]["data"]["activeScore"].toString();
     return {lifetimeScore: lifetimeScore, activeScore: activeScore};
 
 }
