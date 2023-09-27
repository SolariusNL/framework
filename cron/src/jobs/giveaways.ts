import { NotificationType } from "@prisma/client";
import { FwCronJob } from "../classes";
import prisma from "../prisma";
import { cron } from "../schedules";

const giveawayJob = new FwCronJob(
  cron.hours.everyHour,
  "giveaway-job",
  async () => {
    const giveaways = await prisma.teamGiveaway.findMany({
      where: {
        AND: [{ ended: false }, { endsAt: { lte: new Date() } }],
      },
      include: {
        participants: {
          select: {
            id: true,
          },
        },
      },
    });
    console.log(
      `cron ~ 🎉 ${giveaways.length} giveaway${
        giveaways.length === 1 ? "" : "s"
      } ended`
    );

    for (const giveaway of giveaways) {
      const participants = await prisma.user.findMany({
        where: {
          id: {
            in: giveaway.participants.map((p) => p.id),
          },
        },
      });

      if (participants.length === 0) {
        await prisma.teamGiveaway.update({
          where: {
            id: giveaway.id,
          },
          data: {
            ended: true,
            tickets: {
              increment: giveaway.tickets,
            },
          },
        });

        const staff = await prisma.user.findMany({
          where: {
            staffOf: {
              some: {
                id: giveaway.teamId,
              },
            },
            ownedTeams: {
              some: {
                id: giveaway.teamId,
              },
            },
          },
        });

        for (const user of staff) {
          await prisma.notification.create({
            data: {
              type: NotificationType.ALERT,
              title: "Giveaway ended",
              message: `Giveaway ${giveaway.name} ended without any participants. Tickets were refunded to the team.`,
              userId: user.id,
            },
          });
        }

        continue;
      }

      const winner =
        participants[Math.floor(Math.random() * participants.length)];

      await prisma.teamGiveaway.update({
        where: {
          id: giveaway.id,
        },
        data: {
          ended: true,
        },
      });
      await prisma.user.update({
        where: {
          id: winner.id,
        },
        data: {
          tickets: {
            increment: giveaway.tickets,
          },
        },
      });
      await prisma.notification.create({
        data: {
          type: NotificationType.GIFT,
          title: "You won a giveaway!",
          message: `You won ${giveaway.name} and received T$${giveaway.tickets}!`,
          user: {
            connect: {
              id: winner.id,
            },
          },
        },
      });
    }
  }
);

export default giveawayJob;
