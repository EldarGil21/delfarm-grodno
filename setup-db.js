require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

// Проверка наличия переменных окружения
if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT || !DB_NAME) {
    console.error('Ошибка: Не все переменные окружения заданы в .env файле.');
    process.exit(1);
}

async function setupDatabase() {
    console.log('Начинаем процесс инициализации базы данных...');

    // ЭТАП 1: Подключение к системной базе 'postgres' для создания новой БД
    const sysClient = new Client({
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: DB_PORT,
        database: 'postgres',
    });

    try {
        await sysClient.connect();
        console.log('Подключение к системной базе "postgres" успешно.');

        // Проверка, существует ли база данных
        const res = await sysClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [DB_NAME]
        );

        if (res.rowCount === 0) {
            console.log(`База данных "${DB_NAME}" не найдена. Создаем...`);
            await sysClient.query(`CREATE DATABASE "${DB_NAME}"`);
            console.log(`База данных "${DB_NAME}" успешно создана.`);
        } else {
            console.log(`База данных "${DB_NAME}" уже существует. Пропускаем создание.`);
        }

    } catch (err) {
        console.error('Ошибка при создании базы данных:', err.message);
        await sysClient.end();
        process.exit(1);
    } finally {
        await sysClient.end();
    }

    // ЭТАП 2: Подключение к целевой базе данных и выполнение SQL-скрипта
    const targetClient = new Client({
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: DB_PORT,
        database: DB_NAME,
    });

    try {
        await targetClient.connect();
        console.log(`Подключение к целевой базе "${DB_NAME}" успешно.`);

        // Чтение SQL файла
        const sqlPath = path.join(__dirname, 'database.sql');
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Файл ${sqlPath} не найден!`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Выполнение SQL-скрипта создания таблиц...');
        
        // Выполнение всего SQL кода из файла
        await targetClient.query(sql);

        console.log('Таблицы успешно созданы и структура инициализирована!');
        console.log('Готово.');

    } catch (err) {
        console.error('Ошибка при выполнении SQL-скрипта:', err.message);
    } finally {
        await targetClient.end();
    }
}

setupDatabase();