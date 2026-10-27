import { InlineKeyboard } from "grammy";
import { services, ADMIN_ID, WORK_START, WORK_END, DAYS_AHEAD } from "../config.js";
import { sessions } from "../sessions.js";
import { isTaken, addBooking } from "../storage.js";
import { dateKey, prettyDate, shortDate, normalizePhone } from "../helpers.js";
import { mainMenu, phoneMenu, addCancelRow } from "../keyboards.js";

export function registerBooking(bot) {
    bot.hears("Записатися", async (context) => {
        sessions.set(context.from.id, {ste: null});

        const kb = new InlineKeyboard();
        services.forEach((s, i)=> {
            kb.text(`${s.name} - ${s.price} грн`, `service:${i}`).row();
        });
        addCancelRow(kb);
        await context.reply("Оберіть послугу:", {reply_markup: kb});
    });

    bot.callbackQuery(/^service:(\d+)$/, async (context) => {
        const index = Number(context.match[1]);
        const service = services[index];
        await context.answerCallbackQuery();
        if (!service) return;

        sessions.set(context.from.id, {step: null, serviceIndex: index});

        const kb = new InlineKeyboard();
        const today = new Date();
        for (let i = 0; i < DAYS_AHEAD; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const key = dateKey(d);
            kb.text(shortDate(key), `date:${key}`);
            if (i % 2 === 1) kb.row();
        }
        addCancelRow(kb);

        await context.editMessageText(`Послуга: ${service.name}\n\nОберіть дату:`, {
            reply_markup: kb,
        });
    });

    bot.callbackQuery(/^date:(\d{4}-\d{2}-\d{2})$/, async (context) => {
    const date = context.match[1];
    const s = sessions.get(context.from.id);

    if (!s || s.serviceIndex === undefined) {
      await context.answerCallbackQuery({
        text: "Сесія застаріла. Натисніть «Записатися» ще раз",
        show_alert: true,
      });
      return;
    }
    await context.answerCallbackQuery();
    s.date = date;

    const now = new Date();
    const isToday = date === dateKey(now);

    const kb = new InlineKeyboard();
    let count = 0;
    for (let h = WORK_START; h < WORK_END; h++) {
      if (isToday && h <= now.getHours()) continue;
      const time = `${String(h).padStart(2, "0")}:00`;
      if (isTaken(date, time)) continue;
      kb.text(time, `time:${time}`);
      count++;
      if (count % 3 === 0) kb.row();
    }

    if (count === 0) {
      const back = new InlineKeyboard().text("Інша дата", `service:${s.serviceIndex}`);
      addCancelRow(back);
      await context.editMessageText(`На ${prettyDate(date)} вільного часу немає`, {
        reply_markup: back,
      });
      return;
    }

    addCancelRow(kb);
    await context.editMessageText(`${prettyDate(date)}\n\nОберіть час:`, { reply_markup: kb });
  });

  bot.callbackQuery(/^time:(\d{2}:\d{2})$/, async (context) => {
    const time = context.match[1];
    const s = sessions.get(context.from.id);

    if (!s || !s.date) {
      await context.answerCallbackQuery({
        text: "Сесія застаріла. Натисніть «Записатися» ще раз",
        show_alert: true,
      });
      return;
    }

    if (isTaken(s.date, time)) {
      await context.answerCallbackQuery({
        text: "Цей час щойно зайняли. Оберіть інший",
        show_alert: true,
      });
      return;
    }
    await context.answerCallbackQuery();

    s.time = time;
    s.step = "name";
    await context.editMessageText(`Час: ${time}\n\nЯк до вас звертатися? Напишіть ваше ім'я`);
  });

  bot.on("message:contact", async (context) => {
    const s = sessions.get(context.from.id);
    if (!s || s.step !== "phone") return;

    const raw = context.message.contact.phone_number;
    await askConfirmation(context, s, normalizePhone(raw) ?? raw);
  });

  bot.on("message:text", async (context) => {
    const s = sessions.get(context.from.id);
    if (!s || !s.step) return;

    const text = context.message.text.trim();
    if (text.startsWith("/")) return;

    if (s.step === "name") {
      if (text.length < 2 || text.length > 40) {
        await context.reply("Ім'я має бути від 2 до 40 символів. Спробуйте ще раз");
        return;
      }
      s.name = text;
      s.step = "phone";
      await context.reply(
        "Дякуємо! Тепер надішліть номер телефону: натисніть кнопку нижче або напишіть його, наприклад 0501234567",
        { reply_markup: phoneMenu }
      );
      return;
    }

    if (s.step === "phone") {
      const phone = normalizePhone(text);
      if (!phone) {
        await context.reply("Не схоже на український номер. Приклад: 0501234567 або +380501234567");
        return;
      }
      await askConfirmation(context, s, phone);
    }
  });

  async function askConfirmation(context, s, phone) {
    s.phone = phone;
    s.step = "confirm";
    const service = services[s.serviceIndex];

    await context.reply("Номер отримано", { reply_markup: mainMenu });

    const kb = new InlineKeyboard()
      .text("Підтвердити", "confirm")
      .row()
      .text("Скасувати", "cancel");

    await context.reply(
      `Перевірте заявку:\n\n` +
        `Послуга: ${service.name} (${service.price} грн)\n` +
        `Дата: ${prettyDate(s.date)}\n` +
        `Час: ${s.time}\n` +
        `Ім'я: ${s.name}\n` +
        `Телефон: ${s.phone}`,
      { reply_markup: kb }
    );
  }

  bot.callbackQuery("confirm", async (context) => {
    const s = sessions.get(context.from.id);

    if (!s || s.step !== "confirm") {
      await context.answerCallbackQuery({ text: "Заявка вже неактивна", show_alert: true });
      return;
    }

    if (isTaken(s.date, s.time)) {
      await context.answerCallbackQuery({
        text: "На жаль, цей час щойно зайняли. Почніть запис заново",
        show_alert: true,
      });
      sessions.delete(context.from.id);
      return;
    }
    await context.answerCallbackQuery();

    const service = services[s.serviceIndex];
    const booking = {
      id: Date.now(),
      userId: context.from.id,
      username: context.from.username ?? null,
      name: s.name,
      phone: s.phone,
      service: service.name,
      price: service.price,
      date: s.date,
      time: s.time,
      createdAt: new Date().toISOString(),
    };

    addBooking(booking);
    sessions.delete(context.from.id);

    await context.editMessageText(
      `Ви записані!\n\n${service.name}\n${prettyDate(booking.date)}, ${booking.time}\n\n` +
        `Чекаємо на вас. Якщо плани зміняться, зателефонуйте нам`
    );

    if (ADMIN_ID) {
      try {
        await context.api.sendMessage(
          ADMIN_ID,
          `Нова заявка\n\n` +
            `${booking.service} (${booking.price} грн)\n` +
            `${prettyDate(booking.date)}, ${booking.time}\n` +
            `Ім'я: ${booking.name}\n` +
            `Телефон: ${booking.phone}\n` +
            `Telegram: ${booking.username ? "@" + booking.username : "немає username"}`
        );
      } catch (err) {
        console.error("Не вдалося надіслати сповіщення майстру:", err.message);
      }
    }
  });

  bot.callbackQuery("cancel", async (context) => {
    await context.answerCallbackQuery();
    sessions.delete(context.from.id);
    await context.editMessageText("Запис скасовано. Коли будете готові, натисніть «Записатися»");
  });
}