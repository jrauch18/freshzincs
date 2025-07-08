// index.js
const express = require('express');
const fs      = require('fs');
const https   = require('https');

const app = express();
app.use(express.static('public'));

// Load your cert+key from the home-dir install
const options = {
  key:  fs.readFileSync('/home/ec2-user/ssl/freshzincs/privkey.pem'),
  cert: fs.readFileSync('/home/ec2-user/ssl/freshzincs/fullchain.pem'),
};

// Listen on 443 instead of 80/3000
https.createServer(options, app)
     .listen(443, () => {
       console.log('🔒 HTTPS server listening on port 443');
     });
