import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {BOOKINGS_FILE} from "./config.js";

function loadFromFile() {
    if (!existsSync(BOOKINGS_FILE)) return [];
    return JSON.parse(readFileSync(BOOKINGS_FILE, "utf8"));
}

const bookings = loadFromFile();

export function isTaken(date, time) {
    return bookings.some((b) => b.date === date && b.time === time);
}

export function addBooking(booking){
    bookings.push(booking);
    writeFileSync(BOOKINGS_FILE,JSON.stringify(bookings, null, 2));
}