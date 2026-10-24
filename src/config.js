import "dotenv/config";

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const ADMIN_ID = process.env.ADMIN_ID;

if (!BOT_TOKEN) {
    console.error("у файлі .env не знайдемо бота токен");
    process.exit(1);
}

export const services = [
    { name: "Чоловіча стрижка", price: 400 },
    { name: "Стрижка бороди", price: 250 },
    { name: "Стрижка + борода", price: 600 },
    { name: "Дитяча стрижка", price: 300 },
]

export const WORK_START = 12; 
export const WORK_END = 21; 
export const DAYS_AHEAD = 7; 
export const BOOKINGS_FILE = "bookings.json";