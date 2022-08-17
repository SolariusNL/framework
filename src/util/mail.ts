import { createTransport } from "nodemailer";
import logger from "./logger";

const transport = createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendMail = async (
  to: string,
  subject: string,
  html: string
) => {
  const mailOptions = {
    from: process.env.SMTP_USERNAME,
    to,
    subject,
    html,
  };

  await 
    transport.sendMail(mailOptions)
    .then(() => {
      logger().info(`Mail sent to ${to}`);
    })
    .catch((err) => {
      logger().error(`Fail to send mail to ${to}: ${err}`);
    });
};