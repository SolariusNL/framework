import {
  Body,
  createHandler,
  Get,
  Param,
  Patch,
  Query,
} from "@storyofams/next-api-decorators";
import { Account, AdminAuthorized } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { nonCurrentUserSelect } from "../../../util/prisma-types";

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
        completed: status === "all" ? undefined : status === "complete",
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
        completed: status === "all" ? undefined : status === "complete",
      },
    });

    return {
      tasks,
      pages: Math.ceil(count / 10),
    };
  }

  @Patch("/my/tasks/:id/update")
  @AdminAuthorized()
  public async updateMyTask(
    @Param("id") id: string,
    @Body() { completed }: { completed: boolean }
  ) {
    const task = await prisma.employeeTask.update({
      where: {
        id,
      },
      data: {
        completed,
      },
    });

    return task;
  }

  @Get("/my/active")
  @AdminAuthorized()
  public async getActiveStaff() {
    const active = await prisma.employee.findMany({
      where: {
        user: {
          lastSeen: {
            gte: new Date(Date.now() - 5 * 60 * 1000),
          },
        },
      },
      select: {
        user: {
          select: nonCurrentUserSelect.select,
        },
        fullName: true,
      },
    });

    return active;
  }
}

export default createHandler(EmployeeRouter);
