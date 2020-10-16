const { google } = require("googleapis");
const sheets = google.sheets("v4");
const fs = require("fs");
const spreadsheetId = process.env.SHEET_ID;
const { numToLetter } = require("./utils.js");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file"
];

let jwtClient = null;


async function initAuth() {
  if (!jwtClient) {
    let privatekey = {};
    // Auth
    try {
      if (fs.existsSync('./creds.json"')) {
        privatekey = require("./creds.json");
      } else {
        privatekey = {
          client_email: process.env.GAPI_SERVICE_EMAIL,
          private_key: process.env.GAPI_PRIVATE_KEY.replace(/\\n/gm, '\n')
        };
      }
    } catch (err) {
      console.error(err);
    }

    jwtClient = await new google.auth.JWT(
      privatekey.client_email,
      null,
      privatekey.private_key,
      SCOPES
    );
  }

  // Authenticate request
  await jwtClient.authorize(function(err, tokens) {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("Successfully connected TO GAPI");
    }
  });
}

module.exports = {
  readFromSheet: async function(){
    await initAuth();
    const request = {
      spreadsheetId: spreadsheetId,
      range: "A:C", 
      auth: jwtClient
    };
    const response = (await sheets.spreadsheets.values.update(request)).data;
    return response;
  },
  updateSheet: async function(channelsData) {
    await initAuth();
    const channelsAsArr = channelsData.map(obj => [
      obj.id,
      obj.name,
      obj.description
    ]);
    const request = {
      spreadsheetId: spreadsheetId,
      range: "A2:C" + numToLetter(channelsData.length + 1), 
      valueInputOption: "USER_ENTERED",
      resource: {
       values: channelsAsArr
      },
      auth: jwtClient
    };

    try {
      const response = (await sheets.spreadsheets.values.update(request)).data;
    } catch (err) {
      console.error(err);
    }
  }
};
