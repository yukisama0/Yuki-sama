const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Guild = require('../../models/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-rules-channel')
        .setDescription('Set the rules channel')
        .addChannelOption(option => option
            .setName('rule')
            .setDescription('Set the rules channel')
            .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const { options, member, guild } = interaction;

            if (!guild || !guild.available) {
                return interaction.editReply({ content: 'Guild not available', ephemeral: true });
            }

            if (guild.ownerId !== member.id) {
                return interaction.editReply({ content: 'Only the server owner can use this command', ephemeral: true });
            }

            const rule = options.getChannel('rule');
            let guildData = await Guild.findOne({ where: { id: guild.id } });

            if (!guildData) {
                guildData = new Guild({ id: guild.id });
            }

            if (!rule) {
                guildData.rulesId = null;
                await guildData.save();
                await interaction.editReply({ content: 'Disabled the rules channel', ephemeral: true });
            } else {
                guildData.rulesId = rule.id;
                await guildData.save();
                await interaction.editReply({ content: `Set the rules channel to ${rule}`, ephemeral: true });
            }
        } catch (error) {
            console.error('Error updating guild data:', error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: 'An error occurred while updating guild data', ephemeral: true });
            } else {
                await interaction.reply({ content: 'An error occurred while updating guild data', ephemeral: true });
            }
        }
    },
};
