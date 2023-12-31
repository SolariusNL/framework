import { FwCronJob } from "../classes";
import prisma from "../prisma";
import { cron } from "../schedules";

const clearEmailReceiptsJob = new FwCronJob(
  cron.hours.everyTwelveHours,
  "clear-email-receipts",
  async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const emailReceiptsToDelete = await prisma.emailReceipt.deleteMany({
      where: {
        createdAt: {
          lte: sevenDaysAgo,
        },
      },
    });

    console.log(
      `cron ~ 🧹 Purged ${emailReceiptsToDelete.count} expired email receipts.`
    );
  }
);

export default clearEmailReceiptsJob;
