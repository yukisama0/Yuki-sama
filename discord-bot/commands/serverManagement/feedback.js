const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Guild = require('../../models/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Make a feedback text')
        .addStringOption(option => option
            .setName('category')
            .setDescription('Category for the feedback')
            .setRequired(true)
            .addChoices(
                { name: 'Server', value: 'server_feedback' },
                { name: 'Game', value: 'game_feedback' },
                { name: 'Team', value: 'team_feedback' },
                { name: 'Other', value: 'other' }
            )
        )
        .addStringOption(option => option
            .setName('title')
            .setDescription('Title of your feedback')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('text')
            .setDescription('Text of your feedback')
            .setRequired(true)
        ),
    async execute(interaction) {
        try {
            // Fetch guild data to get the feedbackChannelId
            const guildData = await Guild.findOne({ where: { id: interaction.guild.id } });
            if (!guildData || !guildData.feedbackChannelId) {
                return interaction.reply('Feedback channel is not set for this server.');
            }

            const feedbackChannelId = guildData.feedbackChannelId;
            let feedbackChannel = interaction.guild.channels.cache.get(feedbackChannelId);
            if (!feedbackChannel) {
                feedbackChannel = await interaction.guild.channels.fetch(feedbackChannelId).catch(() => null);
            }

            if (!feedbackChannel) {
                return interaction.reply('The feedback channel could not be found.');
            }

            const feedbackCategory = interaction.options.getString('category') || 'N/A';
            const feedbackTitle = interaction.options.getString('title') || 'N/A';
            const feedbackText = interaction.options.getString('text') || 'N/A';
            const embedColor = '#6400ff';

            // Capitalize category (convert to proper format)
            const formattedCategory = feedbackCategory
                .replace(/_/g, ' ') // Replace underscores with spaces
                .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word

            const embed = new EmbedBuilder()
                .setTitle(feedbackTitle)
                .setDescription(feedbackText)
                .setColor(embedColor)
                .setAuthor({ name: formattedCategory, url: 'https://discord.gg/ZyRe42SR4C' })
                .setFooter({ text: 'FTS - Est. 2023', iconURL: 'https://i.imgur.com/le0aT56.png' });

            // Send the embed to the feedback channel
            await feedbackChannel.send({ embeds: [embed] });
            await interaction.reply({ content: 'Your feedback has been sent!', ephemeral: true });
        } catch (error) {
            console.error('Error sending feedback:', error);
            await interaction.reply({ content: 'An error occurred while sending your feedback.', ephemeral: true });
        }
    }
};
