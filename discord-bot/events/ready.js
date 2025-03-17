const { ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Guild = require('../models/guild');
const axios = require('axios');
const chalk = require('chalk');
const moment = require('moment-timezone');
require('dotenv').config();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
let TWITCH_ACCESS_TOKEN = process.env.TWITCH_ACCESS_TOKEN;
let wasLive = false;

async function refreshTwitchToken() {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });
        TWITCH_ACCESS_TOKEN = response.data.access_token;
        console.log(chalk.green('Twitch token refreshed successfully.'));
    } catch (error) {
        console.error(chalk.red('Failed to refresh Twitch token:', error));
    }
}

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(chalk.magenta.bold.underline(`Logged in as ${client.user.tag} ✅`));

        client.user.setActivity('Prevain - The Future is incoming', {
            type: ActivityType.Streaming,
            url: 'https://twitch.tv/dashund007'
        });

        let guildCountOld = 0;
        let memberCountsOld = {};
        const skippedGuilds = new Set();

        await updateGuildCount(client);

        client.on('guildMemberAdd', async (member) => {
            await updateMemberCount(member.guild);
        });

        client.on('guildMemberRemove', async (member) => {
            await updateMemberCount(member.guild);
        });

        for (const guild of client.guilds.cache.values()) {
            await updateMemberCount(guild);
        }

        async function updateMemberCount(guild) {
            try {
                await guild.members.fetch();
                const totalMembers = guild.members.cache.size;

                if (memberCountsOld[guild.id] !== totalMembers) {
                    memberCountsOld[guild.id] = totalMembers;
                    const guildData = await Guild.findOne({ where: { id: guild.id } });
                    if (guildData && guildData.memberCountChannelId) {
                        const memberCountChannel = await guild.channels.fetch(guildData.memberCountChannelId);
                        if (memberCountChannel) {
                            await memberCountChannel.setName(`Members: ${totalMembers}`);
                            console.log(chalk.green(`Updated member count for `) + chalk.red.bold(`${guild.name}: ${totalMembers}\n`));
                        }
                    }
                }
            } catch (error) {
                console.error(chalk.red(`Error updating member count for ${guild.name}:`, error));
            }
        }

        async function updateGuildCount(client) {
            try {
                const guildCount = client.guilds.cache.size;
                if (guildCount !== guildCountOld) {
                    guildCountOld = guildCount;
                    await client.user.setPresence({
                        activities: [{ name: `Guilds: ${guildCount}`, type: ActivityType.Watching }]
                    });
                    console.log(chalk.green(`Updated guild count: ${guildCount}`));
                }
            } catch (error) {
                console.error(chalk.red(`Error updating guild count:`, error));
            }
        }

        let lastNotificationTimes = {};  // Track the last notification time for each user

        const moment = require('moment-timezone');  // Import moment-timezone

        async function checkTwitchLive() {
            try {
                for (const guild of client.guilds.cache.values()) {
                    const guildData = await Guild.findOne({ where: { id: guild.id } });
                    const twitchUsername = guildData ? guildData.twitchUsername : null;
                    if (!twitchUsername) {
                        if (!skippedGuilds.has(guild.id)) {
                            console.log(chalk.yellow(`No Twitch username set for guild ${guild.name}, skipping...`));
                            skippedGuilds.add(guild.id);
                        }
                        continue;
                    }
                    skippedGuilds.delete(guild.id);
                    const twitchChannelId = guildData?.twitchChannelId;
                    const pingRoleId = guildData?.twitchRoleId;
                    const embedColor = guildData?.twitchEmbedColor || '#6400ff';
                    const lastNotificationTime = guildData?.twitchLastNotification;

                    // Get the current time in Berlin timezone
                    const currentTimeBerlin = moment().tz('Europe/Berlin');  // Berlin timezone
                    const cooldownTime = 2 * 60 * 60 * 1000;  // 2 hours cooldown
                
                    try {
                        const url = `https://api.twitch.tv/helix/streams?user_login=${twitchUsername}`;
                        const response = await axios.get(url, {
                            headers: {
                                "Client-ID": TWITCH_CLIENT_ID,
                                "Authorization": `Bearer ${TWITCH_ACCESS_TOKEN}`
                            }
                        });
                        const stream = response.data.data[0];
                    
                        // If the stream is live and cooldown has passed, send a notification
                        if (stream) {
                            // Check if cooldown has passed
                            if (!lastNotificationTime || currentTimeBerlin.diff(moment(lastNotificationTime)) >= cooldownTime) {
                                await guildData.update({ twitchLastNotification: currentTimeBerlin.toDate() });  // Update last notification time in database with Berlin time
                            
                                wasLive = true;
                                const twitchTitle = stream.title || "N/A";
                                const twitchCategory = stream.game_name || "N/A";
                                const userUrl = `https://api.twitch.tv/helix/users?login=${twitchUsername}`;
                                const userResponse = await axios.get(userUrl, {
                                    headers: {
                                        "Client-ID": TWITCH_CLIENT_ID,
                                        "Authorization": `Bearer ${TWITCH_ACCESS_TOKEN}`
                                    }
                                });
                                const userData = userResponse.data.data[0];
                                const twitchIcon = userData ? userData.profile_image_url : 'https://static-cdn.jtvnw.net/jtv_user_pictures/default-profile_image.jpg';
                                const thumbnail = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchUsername.toLowerCase()}-400x225.jpg?timestamp=${Date.now()}`;
                                const embed = new EmbedBuilder()
                                    .setTitle(twitchTitle)
                                    .setURL(`https://twitch.tv/${twitchUsername}`)
                                    .setDescription(`**Game**\n${twitchCategory}`)
                                    .setColor(embedColor)
                                    .setAuthor({ name: `${twitchUsername} is now live on Twitch!`, iconURL: twitchIcon })
                                    .setImage(thumbnail)
                                    .setTimestamp()
                                    .setFooter({ text: 'FTS - Est. 2023', iconURL: 'https://i.imgur.com/le0aT56.png' });
                                const button = new ButtonBuilder()
                                    .setLabel('Watch Stream')
                                    .setURL(`https://twitch.tv/${twitchUsername}`)
                                    .setStyle(ButtonStyle.Link);
                                const row = new ActionRowBuilder().addComponents(button);
                                const channel = await client.channels.fetch(twitchChannelId);
                                if (channel) {
                                    await channel.send({
                                        content: `<@&${pingRoleId}>`,
                                        embeds: [embed],
                                        components: [row]
                                    });
                                    console.log(chalk.bold.cyan(`Twitch notification sent for ${twitchUsername}!`));
                                }
                            } else {
                                // If the stream is live but the cooldown has not passed, log this in the console
                                console.log(chalk.yellow(`${twitchUsername} is still live, but cooldown has not passed yet.`));
                            }
                        } else if (!stream && wasLive) {
                            wasLive = false;
                            console.log(chalk.bold.yellow(`${twitchUsername} is now offline.`));
                        }
                    } catch (error) {
                        if (error.response && error.response.status === 401) {
                            console.log(chalk.red('Twitch token expired, refreshing...'));
                            await refreshTwitchToken();
                        } else {
                            console.error(chalk.red('Error fetching Twitch data:', error));
                        }
                    }
                }
            } catch (error) {
                console.error(chalk.red('Error checking Twitch API:', error));
            }
        }
        
        setInterval(checkTwitchLive, 1000 * 60);  // Check every minute
        console.log(chalk.bold.green(`Twitch check is running!`));
    }
};
