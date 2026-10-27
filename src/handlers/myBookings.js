import { InlineKeyboard } from "grammy";
import { ADMIN_ID, CANCEL_MIN_HOURS } from "../config.js";
import { getUpcomingByUser, findBooking, removeBooking } from "../storage.js";
import { prettyDate, bookingDateTime } from "../helpers.js";

export function registerMyBookings(bot) {
    bot.hears("Мої записи", async (context) => {
        console.log("Натиснули Мої записи, id:", context.from.id);
        const list = getUpcomingByUser(context.from.id);

        if(list.length === 0) {
            await context.reply("У вас немає майбутніх записів, натисність (Записатися)");
            return;
        }

        for (const b of list) {
            const kb = new InlineKeyboard().text("Скасувати цей запис", `mycancel:${b.id}`);
            await context.reply(
                `${b.service} (${b.price} грн )\n ${prettyDate(b.date)}, ${b.time})`,
                { reply_markup: kb}
            );
        }
    });

    bot.callbackQuery(/^mycancel:(\d+)$/, async (context) => {
        const id = Number(context.match[1]);
        const booking = findBooking(id);

        if (!booking || booking.userId !== context.from.id) {
            await context.answerCallbackQuery({
                text: "Запис не знайдено або вже скасовано",
                show_alert: true,
            });
            return;
        }

        const hoursLeft = (bookingDateTime(booking) - new Date()) / 3_600_000;
        if (hoursLeft < CANCEL_MIN_HOURS) {
            await context.answerCallbackQuery({
                text: `Скасувати можна не пізніше ніж за ${CANCEL_MIN_HOURS} год до візиту. Зателефонуйте нам`,
                show_alert: true,
            });
            return;
        }
        removeBooking(id);
        await context.answerCallbackQuery();
        await context.editMessageText(
            `Запис скасовано:\n\n${booking.service}\n${prettyDate(booking.date)}, ${booking.time}`
        );
        if (ADMIN_ID) {
            try {
                await context.api.sendMessage(
                ADMIN_ID,
                `Клієнт скасував запис\n\n` +
                    `${booking.service}\n` +
                    `${prettyDate(booking.date)}, ${booking.time}\n` +
                    `Ім'я: ${booking.name}\n` +
                    `Телефон: ${booking.phone}`
                );
            } catch (err) {
                console.error("Не вдалося надіслати сповіщення майстру:", err.message);
            }
        }
    });
}