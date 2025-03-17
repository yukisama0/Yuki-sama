const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const { clientId } = require('./config.json');
const token = process.env.TOKEN;

if (!token) {
    console.error("Error: No token provided.");
    process.exit(1);
}

function getFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let commandFiles = [];

    for (const file of files) {
        if (file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(`${dir}/${file.name}`)
            ];
        } else if (file.name.endsWith('.js')) {
            commandFiles.push(`${dir}/${file.name}`);
        }
    }
    return commandFiles;
}

let commands = [];
const commandFiles = getFiles('./commands');

for (const file of commandFiles) {
    const command = require(file);
    if (commands.find(c => c.name === command.data.name)) {
        console.warn(`Skipping duplicate command: ${command.data.name}`);
        continue;
    }
    commands.push(command.data.toJSON());
    console.log(`Deploying command: ${command.data.name} ✅`);
}

const rest = new REST({ version: '10' }).setToken(token);

async function deployCommands() {
    try {
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Successfully registered global application commands! ✅');

         const guilds = await rest.get(Routes.userGuilds());

        for (const guild of guilds) {
            const guildId = guild.id;
            try {
                await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
                console.log(`Successfully registered guild-specific application commands on ${guild.name} ✅`);
            } catch (error) {
                console.error(`Error registering commands on ${guild.name}:`, error);
            }
        }
    } catch (error) {
        console.error('Error while deploying commands:', error);
    }
}

deployCommands();
