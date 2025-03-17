const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const chalk = require('chalk');
dotenv.config();

const { clientId } = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ]
});

const sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false,
});

async function connectToDatabase() {
    try {
        await sequelize.authenticate();
        console.log(chalk.green.bold.underline('Connected to MySQL ✅'));
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
    }
}

connectToDatabase();

async function registerCommands() {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
        console.log(`Deploying command: ${command.data.name} ✅`);
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log(chalk.yellow('Successfully registered global application commands!'));
    } catch (error) {
        console.error(error);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

registerCommands().then(() => {
    client.login(process.env.TOKEN);
});
