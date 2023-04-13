/*var myHeaders = new Headers();
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

}

main();*/

