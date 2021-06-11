const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const CLIENT_ID = 'CLEINT ID'
const CLIENT_SECRET = 'CLIENT SECRET';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

//refresh token
const REFRESH_TOKEN = 'REFRESH TOKEN';

//intialize auth client
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

//setting outr credentials
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

//initialize google drive
const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});

//file path for out file
const filePath = path.join(__dirname, 'FILENAME');

//function to upload the file
async function uploadFile() {
    try{
      const response = await drive.files.create({
        requestBody: {
            name: 'hero.png', //file name
            mimeType: 'image/png',
        },
        media: {
            mimeType: 'image/png',
            body: fs.createReadStream(filePath),
        },
      });
  
        console.log(response.data);
    } catch (error) {
        console.log(error.message);
    }
}
  
uploadFile()
//delete file function
async function deleteFile() {
    try {
        const response = await drive.files.delete({
            fileId: 'FILE ID',
        });
        console.log(response.data, response.status);
    } catch (error) {
        console.log(error.message);
    }
  }


//create a public url
async function generatePublicUrl() {
    try {
        const fileId = 'FILE ID';
        //change file permisions
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
            role: 'reader',
            type: 'anyone',
            },
        });

        const result = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink',
        });
      console.log(result.data);
    } catch (error) {
      console.log(error.message);
    }
  }

  generatePublicUrl()