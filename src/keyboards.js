import {Keyboard} from "grammy";

export const mainMenu = new Keyboard()
  .text("Записатися")
  .text("Мої записи")
  .row()
  .text("Послуги та ціни")
  .text("Контакти")
  .resized();

export const phoneMenu = new Keyboard()
    .requestContact("Поділитися номером")
    .row()
    .text("Скасувати запис")
    .resized()
    .oneTime();

export function addCancelRow(kb) {
    return kb.row().text("Скасувати", "cancel");
}    