import "dotenv/config";
import { Bot, Keyboard } from "grammy";


const bot = new Bot(process.env.BOT_TOKEN);

const services = [
    {name: "Чоловіча стрижка: ", price: 400},
    {name: "Стрижка бороди: ", price: 250},
    {name: "Стрижка + борода: ", price: 600},
    {name: "Дитяча стрижка: ", price: 300},
];

const mainMenu = new Keyboard()
    .text("Записатися")
    .row()
    .text("Послуги та ціни")
    .text("Контакти")
    .resized();

bot.command("start", async (context) => {
    await context.reply(
        `Вітаємо, ${context.from.first_name} це бот барбершоп.Тут можна швидко записатися на стрижку`,
        { reply_markup: mainMenu }
    );
});

bot.hears("Послуги та ціни", async (context) => {
    const text = services
    .map((s) => `${s.name} - ${s.price} грн`)
    .join("\n");

    await context.reply(`Наші послуги: \n\n ${text}`);
});

bot.hears("Контакти", async (context) => {
    await context.reply("м.Київ. Працюємо від 12:00 до 21:00");
});

bot.hears("Записатися", async (context) => {
    await context.reply("Запис ми підключимо на наступному кроці");
});

bot.start();
console.log("Бот працює");