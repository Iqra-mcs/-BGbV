const express = require('express');
var bodyParser = require('body-parser');
const passport = require('passport');
const cookieSession = require('cookie-session');
const passportSetup = require('./config/passport-setup');
const fileUpload = require('express-fileupload');
const {google} = require('googleapis');
const fs = require('fs');

const app = express();
app.use(express.static('public'))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(fileUpload());
app.set('view engine', 'ejs');

app.use(cookieSession({
    keys: ['secret123']
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/upload', (req, res) => {

    console.log(req.user);
    if(!req.user) {
        res.redirect('/');
    }
    else {
        let data = {
            id: req.user._id,
            name: req.user.name
        }

        if(req.query.status == 'successful') {
            data.file = 'file uploaded';
        }
        else {
            data.file = 'file not uploaded';
        }


        res.render('upload', data);
    }



});

app.post('/uploadFile', (req, res) => {

    if(!req.user) {
        res.redirect('/');
    }
    else {
         // config google drive with client token
         const oauth2Client = new google.auth.OAuth2()
         oauth2Client.setCredentials({
             'access_token': req.user.accessToken
         });
 
         const drive = google.drive({
             version: 'v3',
             auth: oauth2Client
         });
 
         //move file to google drive
 
         let { name: filename, mimetype, data } = req.files.fileUpload
         let dataToDownload = {

             name: filename,
             mimeType: mimetype,
             location: req.user.name,
             date: Date(Date.now()).toString()

         }
         const driveResponse = drive.files.create({
             requestBody: {
                 name: filename,
                 mimeType: mimetype
             },
             media: {
                 mimeType: mimetype,
                 body: Buffer.from(data).toString()
             }
         });
 
         driveResponse.then(data => {
 
             if (data.status == 200) {
                
                

                res.writeHead(200, {
                    'Content-Type': 'application/json-my-attachment',
                    "content-disposition": "attachment; filename=\"download.json\""
                });
                
                
                res.end(JSON.stringify(dataToDownload));
                res.redirect('/upload?status=successful'); // success
             } 
             else {
                res.redirect('/upload?status=unsuccessful');
             }
 
         }).catch(err => { throw new Error(err) })

    }

});
app.post('/login', (req, res) => {
    if(req.body.selectedNode == 1) {
        res.redirect('/login1');
    }
    else if(req.body.selectedNode == 2) {
        res.redirect('/login2');
    }
    else if(req.body.selectedNode == 3) {
        res.redirect('/login3');
    }
})
app.get('/login1',passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/drive', 'profile'],

}));

app.get('/login2',passport.authenticate('google2', {
    scope: ['https://www.googleapis.com/auth/drive', 'profile'],

}));

app.get('/login3',passport.authenticate('google3', {
    scope: ['https://www.googleapis.com/auth/drive', 'profile'],

}));

app.get('/login/redirect', passport.authenticate('google'), (req, res) => {

    res.redirect('/upload');
   
})

app.get('/login2/redirect', passport.authenticate('google2'), (req, res) => {

    res.redirect('/upload')
   
})

app.get('/login3/redirect', passport.authenticate('google3'), (req, res) => {

    res.redirect('/upload');
   
})

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Running server...')
})
