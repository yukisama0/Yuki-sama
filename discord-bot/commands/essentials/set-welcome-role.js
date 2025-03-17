const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Guild = require('../../models/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-welcome-role')
        .setDescription('Set the role for this guild that will be given to new members')
        .addRoleOption(option => option
            .setName('role')
            .setDescription('Role to give new members upon joining')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

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

            const role = options.getRole('role');
            let guildData = await Guild.findOne({ where: { id: guild.id } });

            if (!guildData) {
                guildData = new Guild({ id: guild.id });
            }

            if (!role) {
                guildData.welcomeRoleId = null;
                await guildData.save();
                await interaction.editReply({ content: 'Disabled the welcome role system', ephemeral: true });
            } else {
                guildData.welcomeRoleId = role.id;
                await guildData.save();
                const embed = new EmbedBuilder()
                    .setTitle('Welcome Role')
                    .setDescription(`Set the role for welcome message to ${role}`)
                    .setColor('#6400ff')
                    .setAuthor({ name: 'FTS - Est. 2023', iconURL: 'https://i.imgur.com/le0aT56.png', url: 'https://discord.gg/ZyRe42SR4C' });

                await interaction.editReply({ embeds: [embed], ephemeral: true });
            }
        } catch (error) {
            console.error('Error updating guild data:', error);
            await interaction.editReply({ content: 'An error occurred while updating guild data', ephemeral: true });
        }
    },
};
