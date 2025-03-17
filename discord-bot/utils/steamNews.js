const axios = require('axios');
const SteamGame = require('../models/steamGame');
const { client } = require('../index');  // Import the client from index.js

async function fetchAndPostNews() {
    const games = await SteamGame.findAll();

    for (const game of games) {
        try {
            const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${game.appId}`;
            const response = await axios.get(url);
            const newsItems = response.data.appnews.newsitems;

            if (!newsItems || newsItems.length === 0) continue;

            const latestNews = newsItems[0];
            if (latestNews.gid === game.lastNewsId) continue;

            const channel = await client.channels.fetch(game.channelId);
            if (channel) {
                await channel.send({
                    embeds: [{
                        title: latestNews.title,
                        url: latestNews.url,
                        description: latestNews.contents.substring(0, 400) + '...',
                        color: 0x1b2838,
                        timestamp: new Date(latestNews.date * 1000),
                        footer: { text: 'Steam News' }
                    }]
                });

                await game.update({ lastNewsId: latestNews.gid });
            }
        } catch (error) {
            console.error(`Error fetching news for App ${game.appId}:`, error);
        }
    }
}

client.once('ready', () => {
    console.log('Bot is ready! Starting Steam News check...');
    setInterval(fetchAndPostNews, 10 * 60 * 1000); // Check every 10 minutes
});
