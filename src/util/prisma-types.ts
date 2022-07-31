import { Prisma } from "@prisma/client";

const user = Prisma.validator<Prisma.UserArgs>()({

});

export type User = Prisma.UserGetPayload<typeof user>;