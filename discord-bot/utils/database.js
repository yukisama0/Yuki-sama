const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');
dotenv.config();

const sequelize = new Sequelize(process.env.MYSQL_URL, {
    host: '192.168.1.209',
    port: 3306,
    dialect: 'mysql',
    logging: false,
});

async function connect() {
    try {
        await sequelize.authenticate();
        console.log('MySQL connection established');
    } catch (error) {
        console.error('Error connecting to MySQL:', error.message);
    }
}

connect();

module.exports = sequelize;
