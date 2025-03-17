const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const SteamGame = sequelize.define('SteamGame', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    channelId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    appId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lastNewsId: {
        type: DataTypes.STRING,
        defaultValue: null
    }
}, {
    tableName: 'steam_games',
    timestamps: false
});

module.exports = SteamGame;

async function syncDatabase() {
    try {
        await SteamGame.sync({ alter: true });
        console.log('SteamGame table synchronized');
    } catch (error) {
        console.error('Error syncing SteamGame table:', error.message);
    }
}

syncDatabase();
