import { FwCronJob } from "../classes";
import prisma from "../prisma";
import { cron } from "../schedules";

const clearAdminActivityLogJob = new FwCronJob(
  cron.hours.everyTwelveHours,
  "clear-admin-activities",
  async () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const logsToDelete = await prisma.adminActivityLog.deleteMany({
      where: {
        createdAt: {
          lte: oneMonthAgo,
        },
      },
    });

    console.log(
      `cron ~ 🧹 Purged ${logsToDelete.count} out-of-date admin activity logs`
    );
  }
);

export default clearAdminActivityLogJob;
