import { createHandler, Get, Query } from "@storyofams/next-api-decorators";
import { Account, AdminAuthorized } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";

class EmployeeRouter {
  @Get("/my/tasks")
  @AdminAuthorized()
  public async getMyTasks(
    @Account() user: User,
    @Query("page") page: number = 1,
    @Query("status") status: "incomplete" | "complete" | "all" = "incomplete"
  ) {
    const tasks = await prisma.employeeTask.findMany({
      where: {
        employee: {
          userId: user.id,
        },
        completed: status === "complete",
      },
      take: 10,
      skip: (page - 1) * 10,
      orderBy: {
        createdAt: "desc",
      },
    });
    const count = await prisma.employeeTask.count({
      where: {
        employee: {
          userId: user.id,
        },
        completed: status === "complete",
      },
    });

    return {
      tasks,
      pages: Math.ceil(count / 10),
    };
  }
}

export default createHandler(EmployeeRouter);
