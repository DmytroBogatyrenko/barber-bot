import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { BOOKINGS_FILE } from "./config.js";
import { bookingDateTime } from "./helpers.js";

function loadFromFile() {
  if (!existsSync(BOOKINGS_FILE)) return [];
  return JSON.parse(readFileSync(BOOKINGS_FILE, "utf8"));
}

function saveToFile() {
  writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

const bookings = loadFromFile();

export function isTaken(date, time) {
  return bookings.some((b) => b.date === date && b.time === time);
}

export function addBooking(booking) {
  bookings.push(booking);
  saveToFile();
}

export function getBookingsByDate(date) {
  return bookings
    .filter((b) => b.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function getUpcomingByUser(userId) {
  const now = new Date();
  return bookings
    .filter((b) => b.userId === userId && bookingDateTime(b) > now)
    .sort((a, b) => bookingDateTime(a) - bookingDateTime(b));
}

export function findBooking(id) {
  return bookings.find((b) => b.id === id);
}

export function removeBooking(id) {
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;
  const [removed] = bookings.splice(index, 1);
  saveToFile();
  return removed;
}  