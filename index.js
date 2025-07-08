// index.js
const express = require('express');
const fs      = require('fs');
const https   = require('https');
const AWS     = require('aws-sdk');

const app = express();
app.use(express.static('public'));
app.use(express.json());  // parse JSON bodies

// SES config (uses your EC2 IAM role)
AWS.config.update({ region: 'us-east-1' });
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// Contact form handler
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const params = {
    Source: 'no-reply@freshzincs.com',        // your verified SES identity
    Destination: { ToAddresses: ['sam@ssr-technologies.com'] },
    ReplyToAddresses: [email],
    Message: {
      Subject: { Data: `New inquiry from ${name}` },
      Body: {
        Text: { Data:
          `Name: ${name}\nEmail: ${email}\n\n${message}`
        }
      }
    }
  };

  try {
    await ses.sendEmail(params).promise();
    res.json({ success: true });
  } catch (err) {
    console.error('SES error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// HTTPS server (your existing cert paths)
const options = {
  key:  fs.readFileSync('/home/ec2-user/ssl/freshzincs/privkey.pem'),
  cert: fs.readFileSync('/home/ec2-user/ssl/freshzincs/fullchain.pem'),
};
https.createServer(options, app)
     .listen(443, () => console.log('🔒 HTTPS on 443'));
