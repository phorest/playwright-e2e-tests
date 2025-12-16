const fetch = require("node-fetch");
const myHeaders = new fetch.Headers();
const { user } = require("../queries/user.query");

async function getUserID(file, token) {
  const config = require(`../../config/${file}.json`);
  const graphQLUrl = config.env.graphQLUrl;
  const businessID = config.env.businessID;
  const branchID = config.env.branchID;

  myHeaders.append("x-memento-security-context", businessID + "|" + branchID);
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", "application/json");

  const graphql = JSON.stringify({
    query: user.getUser,
    variables: {},
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: graphql,
    redirect: "follow",
  };

  return await fetch(graphQLUrl, requestOptions)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("2. Server response wasn't OK");
      }
    })
    .then((json) => {
      myHeaders.delete("x-memento-security-context");
      myHeaders.delete("Authorization");
      myHeaders.delete("Content-Type");

      return json.data.user.id;
    });
}

module.exports = { getUserID };
