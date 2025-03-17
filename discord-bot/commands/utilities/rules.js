const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Guild = require('../../models/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Help menu for the bot'),

    async execute(interaction) {
        try {
            const guildData = await Guild.findOne({ where: { id: interaction.guild.id } });
            if (!guildData || !guildData.rulesId) {
                return interaction.reply('Rules channel is not set for this server.');
            }

            const rulesChannelId = guildData.rulesId;
            let rulesChannel = interaction.guild.channels.cache.get(rulesChannelId);
            if (!rulesChannel) {
                rulesChannel = await interaction.guild.channels.fetch(rulesChannelId).catch(() => null);
            }

            if (!rulesChannel) {
                return interaction.reply('The rules channel could not be found.');
            }

            const embed = new EmbedBuilder()
                .setTitle('**Help**')
                .setDescription('Displays a help menu with useful information about the bot. This includes links to important channels like the rules and the support server, as well as details on how to get additional assistance.')
                .setColor('#6400ff')
                .setAuthor({ name: 'FTS - Est. 2023', iconURL: 'https://i.imgur.com/le0aT56.png', url: 'https://discord.gg/ZyRe42SR4C' })
                .addFields(
                    {
                        name: 'Rules',
                        value: `[${rulesChannel.name}](https://discord.com/channels/${interaction.guild.id}/${rulesChannelId})`,
                        inline: true
                    },
                    {
                        name: 'Need more help?',
                        value: `Join our [support server](https://discord.gg/ZyRe42SR4C)`,
                        inline: true
                    }
                );

            const rulesButton = new ButtonBuilder()
                .setLabel('View rules')
                .setURL(`https://discord.com/channels/${interaction.guild.id}/${rulesChannelId}`)
                .setStyle(ButtonStyle.Link);

            const joinButton = new ButtonBuilder()
                .setLabel('Join server')
                .setURL('https://discord.gg/ZyRe42SR4C')
                .setStyle(ButtonStyle.Link);

            const row = new ActionRowBuilder()
                .addComponents(rulesButton, joinButton);

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });
        } catch (error) {
            console.error('Error while executing the help command:', error);
            await interaction.reply('An error occurred while processing your request.');
        }
    }
};
