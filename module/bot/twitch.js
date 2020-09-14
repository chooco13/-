const path = require("path");

const express = require('express');
const router = express.Router();

const tmi = require('tmi.js');
const request = require('request');

const database = require('../firebase/database');
const ref = database.db.ref("/tmi/");
const cron = require('node-cron');

const client = new tmi.Client({
	options: { debug: true },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'YOUR_ID',
		password: 'oauth:YOUR_OAUTH'
	},
	channels: [ 'YOUR_CHANNEL' ]
});
client.connect().catch(console.error);
client.on('message', (channel, tags, message, self) => {
  if (self) return;
  if (message.toLowerCase() === '!안녕') {
    client.say(channel, `@${tags.username}님 어서오시궁~!`);
  }
});

cron.schedule('* * * * *', function () {
    crawl();
});

function crawl() {
	request.get('https://tmi.twitch.tv/group/user/' + YOUR_ID + '/chatters', function (error, response, body) {
		if (error) {
			throw error;
		}
		var chatterData = JSON.parse(body);
		console.log(chatterData.chatters.viewers);
		chatterData.chatters.viewers.forEach(function (viewer) {
			ref.child('viewers/' + viewer).once('value', function (snapshot) {
				if (!snapshot.exists()) {
					getUserDisplayName(viewer);
				}
			});
		})
	});
}

function getUserDisplayName(id) {
	var options = {
		uri: 'https://api.twitch.tv/kraken/users?login=' + id,
		headers: {
			'Accept': 'application/vnd.twitchtv.v5+json',
			'Client-ID': 'YOUR_CLIENT_ID',
		},
	}

	request.get(options, function (error, response, body) {
		if (error) {
			throw error;
		}

		var userData = JSON.parse(body);
		var user = userData.users[0];
		client.say('YOUR_ID', `어서와 여기는 처음이지~?! @${user.display_name}님 어서오시궁~!`);
		ref.child('viewers/' + id).set({ createdAt: new Date().getTime(), display_name: user.display_name })
	});
}

router.get('/welcome', function(req, res) {
    res.sendFile(path.join(__dirname + '/welcome.html'));
});

router.get('/audio', function(req, res) {
    res.sendFile(path.join(__dirname + '/audio.html'));
});

module.exports = router;