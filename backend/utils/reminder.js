import cron from "node-cron";
import Machine from "../models/Machine.js";
import nodemailer from "nodemailer"; // optional

export const startReminders = () => {
  // every day at 08:00
  cron.schedule("0 8 * * *", async () => {
    const today = new Date();
    const in15 = new Date(); in15.setDate(in15.getDate() + 15);

    // rc expiry in next 15 days
    const rcSoon = await Machine.find({ rcExpiry: { $gte: today, $lte: in15 } });
    const insSoon = await Machine.find({ insuranceExpiry: { $gte: today, $lte: in15 } });

    // process reminders: log / send email / push
    console.log("RC expiring soon:", rcSoon.length, "Insurance expiring soon:", insSoon.length);

    // you can send emails or push notifications here
  });
};
