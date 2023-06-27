import {
  Body,
  createHandler,
  Delete,
  Get,
  Param,
  Post,
} from "@storyofams/next-api-decorators";
import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";

interface CreateChecklistBody {
  name: string;
  description: string;
}

interface ChecklistTaskCreateBody {
  name: string;
  description: string;
  tags?: string[];
  schedule?: Date;
}

export interface ChecklistTaskUpdateBody {
  completed?: boolean;
  scheduled?: Date;
  description?: string;
}

class ChecklistRouter {
  @Get()
  @Authorized()
  public async getChecklists(@Account() user: User) {
    const checklists = await prisma.checklist.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: true,
      },
    });

    return checklists;
  }

  @Post("/create")
  @Authorized()
  public async createChecklist(
    @Account() user: User,
    @Body() data: CreateChecklistBody
  ) {
    const { name, description } = data;

    if (
      name.length < 3 ||
      name.length > 80 ||
      description.length > 500 ||
      description.length < 3
    ) {
      return {
        success: false,
        message: "Invalid checklist name or description.",
      };
    }

    await prisma.checklist.create({
      data: {
        name,
        description,
        userId: user.id,
      },
      include: {
        items: true,
      },
    });

    return {
      success: true,
    };
  }

  @Post("/:id/tasks/create")
  @Authorized()
  public async createChecklistTask(
    @Account() user: User,
    @Param("id") id: string,
    @Body() data: ChecklistTaskCreateBody
  ) {
    const { name, description, schedule, tags } = data;
    if (
      name.length < 3 ||
      name.length > 80 ||
      description.length > 1024 ||
      description.length < 3
    ) {
      return {
        success: false,
        message: "Invalid task name or description.",
      };
    }

    if (schedule && new Date(schedule as Date).getTime() < Date.now()) {
      return {
        success: false,
        message: "Invalid task schedule.",
      };
    }

    if (
      tags &&
      !Array.isArray(tags) &&
      (tags as Array<string>).some((t) => t.length > 20)
    ) {
      return {
        success: false,
        message: "Invalid task tags.",
      };
    }

    const checklist = await prisma.checklist.findFirst({
      where: {
        id: String(id),
        userId: user.id,
      },
    });

    if (!checklist) {
      return {
        success: false,
        message: "Invalid checklist.",
      };
    }

    const task = await prisma.checklistItem.create({
      data: {
        name,
        description,
        checklist: {
          connect: {
            id: checklist.id,
          },
        },
        ...(schedule && {
          scheduled: new Date(schedule as Date),
        }),
        ...(tags && {
          tags: {
            set: tags as string[],
          },
        }),
      },
    });

    return task;
  }

  @Post("/:id/tasks/:taskId/update")
  @Authorized()
  public async updateChecklistTask(
    @Account() user: User,
    @Param("id") id: string,
    @Param("taskId") taskId: string,
    @Body() data: ChecklistTaskUpdateBody
  ) {
    const updatable = ["scheduled", "completed", "description"];

    const checks: Record<string, (v: any) => boolean> = {
      scheduled: (v: any) => new Date(v).getTime() > Date.now(),
      completed: (v: any) => typeof v === "boolean",
      description: (v: any) =>
        typeof v === "string" && v.length < 1024 && v.length > 3,
    };

    if (
      !Object.keys(data).every((k) => updatable.includes(k)) ||
      !Object.keys(data).every((k) => checks[k](data[k as keyof typeof data]))
    ) {
      return {
        success: false,
        message: "Invalid data.",
      };
    }

    const checklist = await prisma.checklist.findFirst({
      where: {
        id: String(id),
        userId: user.id,
      },
    });

    if (!checklist) {
      return {
        success: false,
        message: "Invalid checklist.",
      };
    }

    const task = await prisma.checklistItem.update({
      where: {
        id: String(taskId),
      },
      data: {
        ...Object.keys(data).reduce(
          (acc, k) => ({
            ...acc,
            [k]: data[k as keyof typeof data],
          }),
          {}
        ),
      },
    });

    return task;
  }

  @Post("/:id/tasks/:taskId/delete")
  @Authorized()
  public async deleteChecklistTask(
    @Account() user: User,
    @Param("id") id: string,
    @Param("taskId") taskId: string
  ) {
    const checklist = await prisma.checklist.findFirst({
      where: {
        id: String(id),
        userId: user.id,
      },
    });

    if (!checklist) {
      return {
        success: false,
        message: "Invalid checklist.",
      };
    }

    await prisma.checklistItem.delete({
      where: {
        id: String(taskId),
      },
    });

    return {
      success: true,
    };
  }

  @Delete("/:id/delete")
  @Authorized()
  public async deleteChecklist(
    @Account() user: User,
    @Param("id") id: string
  ) {
    const checklist = await prisma.checklist.findFirst({
      where: {
        id: String(id),
        userId: user.id,
      },
    });

    if (!checklist) {
      return {
        success: false,
        message: "Invalid checklist.",
      };
    }

    await prisma.checklist.delete({
      where: {
        id: String(id),
      },
    });

    return {
      success: true,
    };
  }
}

export default createHandler(ChecklistRouter);
