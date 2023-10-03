import cast from "@/util/cast";
import logger from "@/util/logger";
import Queue from "bull";
import { createTransport } from "nodemailer";

type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
};

const transport = createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});
const queue =
  process.env.REDIS_URL && process.env.REDIS_URL !== "redis://CHANGE_ME:6379"
    ? new Queue("mail", String(process.env.REDIS_URL))
    : null;

export const sendMail = async ({ to, subject, html }: SendMailOptions) => {
  const mailOptions = {
    from: process.env.SMTP_USERNAME,
    to,
    subject,
    html,
  };

  if (!queue) {
    await transport
      .sendMail(mailOptions)
      .then(() => {
        logger().info(`Mail sent to ${to}`);
      })
      .catch((err) => {
        logger().error(`Fail to send mail to ${to}: ${err}`);
      });
    logger().warn(
      "It is recommended to use a queue for sending mails to prevent clogging up the Framework server thread."
    );
    return;
  } else {
    queue.add(mailOptions, {
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: true,
    });
  }

  logger().info(`Mail queued to ${to} (${subject})`);
};

if (queue) {
  queue.process(async (job, done) => {
    try {
      const { to, subject, html } = job.data;
      await transport
        .sendMail({
          from: process.env.SMTP_USERNAME,
          to,
          subject,
          html,
        })
        .then(() => {
          logger().info(`Mail sent to ${to} (${subject})`);
          done();
        })
        .catch((err) => {
          logger().error(`Fail to send mail to ${to}: ${err}`);
          done(err);
        });
    } catch (err) {
      logger().error(
        `Fail to send mail to ${job.data.to} with error: ${
          cast<Error>(err).message
        }`
      );
    }
  });

  queue.on("global:completed", (jobId, result) => {
    logger().info(
      `Job ${jobId} completed with result ${
        result || "No response information - all is well"
      }`
    );
  });

  queue.on("global:failed", (jobId, err) => {
    logger().error(`Job ${jobId} failed with error: ${err}`);
  });
}
