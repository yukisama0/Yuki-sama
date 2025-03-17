const { SlashCommandBuilder } = require('discord.js');
const Guild = require('../../models/guild');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-counter')
        .setDescription('Delete all member count voice channels'),

    async execute(interaction) {
        const guild = interaction.guild;

        if (interaction.user.id !== process.env.BOT_OWNER) {
            return interaction.reply({
                content: 'You are not authorized to use this command.'
            });
        }

        const guildData = await Guild.findOne({ where: { id: guild.id } });
        if (!guildData || !guildData.memberCountChannelId) {
            return interaction.reply({ content: 'No member count channels found.', ephemeral: true });
        }

        const memberCountChannels = guild.channels.cache.filter(channel => channel.name.startsWith('Members:'));

        if (memberCountChannels.size === 0) {
            return interaction.reply({ content: 'No member count channels found to delete.', ephemeral: true });
        }

        try {
            for (const channel of memberCountChannels.values()) {
                await channel.delete();
            }

            guildData.memberCountChannelId = null;
            await guildData.save();

            interaction.reply({ content: 'All member count channels have been deleted.', ephemeral: true });
        } catch (error) {
            console.error('Error deleting member count channels:', error);
            interaction.reply({ content: 'An error occurred while deleting the member count channels.', ephemeral: true });
        }
    },
};
