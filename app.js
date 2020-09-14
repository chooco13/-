const express = require('express');

const app = express();

app.get('/', function (req, res) {
    res.send("Hello World!");
});

const twitch = require('./module/bot/twitch');
app.use('/twitch/', twitch);
app.use('/resources', express.static('resources'));

app.listen(process.env.PORT || 5000);
