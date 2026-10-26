import { ADMIN_ID } from "../config.js";
import { getBookingsByDate } from "../storage.js";
import { dateKey, prettyDate } from "../helpers.js";

function isAdmin(context) {
  return String(context.from.id) === String(ADMIN_ID);
}

async function showDay(context, date) {
  const list = getBookingsByDate(date);

  if (list.length === 0) {
    await context.reply(`На ${prettyDate(date)} записів немає`);
    return;
  }

  const lines = list.map((b) => {
    const tg = b.username ? ` @${b.username}` : "";
    return `${b.time} - ${b.name}, ${b.service}\n    ${b.phone}${tg}`;
  });

  const total = list.reduce((sum, b) => sum + b.price, 0);

  await context.reply(
    `${prettyDate(date)}\n\n${lines.join("\n\n")}\n\n` +
      `Усього записів: ${list.length}, на суму ${total} грн`
  );
}

export function registerAdmin(bot) {
  bot.command("today", async (context) => {
    if (!isAdmin(context)) {
      await context.reply("Ця команда доступна лише майстру");
      return;
    }
    await showDay(context, dateKey(new Date()));
  });

  bot.command("tomorrow", async (context) => {
    if (!isAdmin(context)) {
      await context.reply("Ця команда доступна лише майстру");
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    await showDay(context, dateKey(d));
  });
}