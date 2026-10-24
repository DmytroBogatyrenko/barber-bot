import {services} from "../config.js";
import {sessions} from '../sessions.js';
import {mainMenu} from "../keyboards.js";

export function registerMenu(bot) {
    bot.command("start", async (context)=>{
        sessions.delete(context.from.id);
        await context.reply(
            `Вітаємо ${context.from.first_name} це бот барбершопу. Тут можна швидко записатися на стрижку`,
            {reply_markup: mainMenu}
        );
    });
    bot.hears("Послуги та ціни", async (context) => {
    const text = services.map((s) => `${s.name} - ${s.price} грн`).join("\n");
    await context.reply(`Наші послуги: \n\n${text}`);
  });

  bot.hears("Контакти", async (context) => {
    await context.reply("м. Київ. Працюємо від 12:00 до 21:00");
  });

  async function cancelFlow(context) {
    sessions.delete(context.from.id);
    await context.reply("Запис скасовано. Коли будете готові, натисніть «Записатися».", {
      reply_markup: mainMenu,
    });
  }
  bot.hears("Скасувати запис", cancelFlow);
  bot.command("cancel", cancelFlow);
}