const Guild = require('./models/guild');
const SteamGame = require('./models/steamGame');

(async () => {
    try {
        await Guild.sync({ alter: true });
        console.log('Guild table synced');
        
        await SteamGame.sync({ alter: true });
        console.log('SteamGame table synced');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
})();
