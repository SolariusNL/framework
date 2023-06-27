import { AdminPermission } from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from "@storyofams/next-api-decorators";
import { postSelect } from "@/components/Admin/Employee/Board";
import { Account, AdminAuthorized } from "@/util/api/authorized";
import { sendMail } from "@/util/mail";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { nonCurrentUserSelect } from "@/util/prisma-types";

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

  @Post("/my/tasks/assign")
  @AdminAuthorized()
  public async assignTask(
    @Body()
    { user, title, content }: { user: number; title: string; content: string },
    @Account() assignee: User
  ) {
    const task = await prisma.employeeTask.create({
      data: {
        title,
        content,
        employee: {
          connect: {
            userId: user,
          },
        },
      },
      select: {
        employee: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    sendMail(
      task.employee.user?.email!,
      "New task assigned",
      `
      <h1>New task assigned</h1>
      <hr />
      <table>
        <tr>
          <td>Title</td>
          <td>${title}</td>
        </tr>
        <tr>
          <td>Content</td>
          <td>${content}</td>
        </tr>
        <tr>
          <td>Assigned by</td>
          <td>${assignee.employee?.fullName} (${assignee.username})</td>
        </tr>
      </table>
      `
    );

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
        role: true,
        contactEmail: true,
      },
    });

    return active;
  }

  @Post("/board/post")
  @AdminAuthorized()
  public async postBoard(
    @Account() user: User,
    @Body() { title, content }: { title: string; content: string }
  ) {
    if (!user.adminPermissions.includes(AdminPermission.WRITE_BLOG_POST)) {
      throw new UnauthorizedException("You do not have permission to do this");
    }

    const post = await prisma.portalBoardPost.create({
      data: {
        title,
        content,
        author: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return post;
  }

  @Get("/board")
  @AdminAuthorized()
  public async getBoard() {
    const posts = await prisma.portalBoardPost.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: postSelect,
    });

    return posts;
  }
}

export default createHandler(EmployeeRouter);
