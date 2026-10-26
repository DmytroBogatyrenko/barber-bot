import { Bot } from "grammy";
import { BOT_TOKEN } from "./src/config.js";
import { registerMenu } from "./src/handlers/menu.js";
import { registerMyBookings } from "./src/handlers/myBookings.js";
import { registerAdmin } from "./src/handlers/admin.js";
import { registerBooking } from "./src/handlers/booking.js";

const bot = new Bot(BOT_TOKEN);

registerMenu(bot);
registerMyBookings(bot);
registerAdmin(bot);
registerBooking(bot);

bot.catch((err) => {
  console.error("Помилка в боті:", err.error);
});

bot.start();
console.log("Бот працює");