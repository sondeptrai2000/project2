// const fs = require("fs")
// var path = require('path');

// const { google } = require("googleapis")
// const CLIENT_ID = "279772268126-bdo0c5g58jriuo7l057rdphld66t8cmj.apps.googleusercontent.com"
// const CLIENT_SECRET = "4FHV8fvNK4ZLyfPBzi5SDs7a"
// const REDIRECT_URI = "https://developers.google.com/oauthplayground"
// const REFRESH_TOKEN = "1//04mxnz8PDmJqPCgYIARAAGAQSNwF-L9IrXlllX3VQC3WHsMYWLurSeQ-vIlWhC4h5tARnLCiGkNCObrHwmxvmtTOX_AG-a2N49Mo"

// const oauth2Client = new google.auth.OAuth2(
//     CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
// );

// oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

// const drive = google.drive({
//     version: 'v3',
//     auth: oauth2Client
// })

// const filePath = path.join(__dirname, 'slide-1.jpg')

// async function uploadFile() {
//     try {
//         const response = await drive.files.create({
//             requestBody: {
//                 name: 'slide-1.jpg', //This can be name of your choice
//                 mimeType: 'image/png',
//             },
//             media: {
//                 mimeType: 'image/png',
//                 body: fs.createReadStream(filePath),
//             },
//         });

//         console.log("response.data:");
//         console.log(response.data);
//     } catch (error) {
//         console.log("error.message");
//         console.log(error.message);
//     }
// }

// uploadFile();

// // async function deleteFile() {
// //     try {
// //         const response = await drive.files.delete({
// //             fileId: 'YOUR FILE ID',
// //         });
// //         console.log(response.data, response.status);
// //     } catch (error) {
// //         console.log(error.message);
// //     }
// // }

// // // deleteFile();

// // async function generatePublicUrl() {
// //     try {
// //         const fileId = '1qeAibjdgRcdGvzZwkCcl5AC1kuhkRgiV';
// //         await drive.permissions.create({
// //             fileId: fileId,
// //             requestBody: {
// //                 role: 'reader',
// //                 type: 'anyone',
// //             },
// //         });

// //         /* 
// //         webViewLink: View the file in browser
// //         webContentLink: Direct download link 
// //         */
// //         const result = await drive.files.get({
// //             fileId: fileId,
// //             fields: 'webViewLink, webContentLink',
// //         });
// //         console.log(result.data);
// //     } catch (error) {
// //         console.log(error.message);
// //     }
// // }

// // // generatePublicUrl();