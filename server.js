const express = require("express");
const app = express();


/*app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
    res.write('<p>Test2</p>');
    res.send();
});*/

app.use(express.static("client_stuff"));
app.use(express.urlencoded({extended: false}));

app.post('/', (req, res) => {
    playerOneInfo = getPlayer(req.body.name1);
    res.send(getTriumph(playerOneInfo));
});

// Start the web server
app.listen(3000, function() {
    console.log("Listening on port 3000...");
 });
 





 var myHeaders = new Headers();
 myHeaders.append("x-api-key", "b79ca68003714acf8ccf1a0848a37a5b");
 myHeaders.append("Content-Type", "text/plain");
 
 
 async function getPlayer(playerName) {
 
     let response = await fetch("https://www.bungie.net/Platform/User/Search/GlobalName/0/", {
         method: 'POST',
         headers: myHeaders,
         redirect: 'follow',
         body: `{\"displayNamePrefix\" : \"${playerName}\"}`
     });
     response = await response.json();
     var memberId = response["Response"]["searchResults"][0]["destinyMemberships"][0]["membershipId"];
     var memberType = response["Response"]["searchResults"][0]["destinyMemberships"][0]["membershipType"];
     console.log([memberId, memberType]);
     return {memberId: memberId, memberType: memberType};
 
 }
 
 
 async function getTriumph(memberInfo) {
 
     var requestOptions = { method: "Get", headers: myHeaders };
     let response = await fetch(`https://www.bungie.net/Platform/Destiny2/${memberInfo['memberType']}/Profile/${memberInfo['memberId']}/?components=Records`, requestOptions);
     response = await response.json();
     return response["Response"]["profileRecords"]["data"]["lifetimeScore"];
 
 }
 
 
 async function main() {
 
     memberInfo = await getPlayer('SharkBurn4');
     score = await getTriumph(memberInfo);
     console.log(score);
     return score;
 
 }