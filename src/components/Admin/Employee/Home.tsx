import ModernEmptyState from "@/components/modern-empty-state";
import ShadedButton from "@/components/shaded-button";
import ShadedCard from "@/components/shaded-card";
import getMediaUrl from "@/util/get-media";
import { NonUser } from "@/util/prisma-types";
import {
  Avatar,
  Badge,
  Divider,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { EmployeeRole, EmployeeTask } from "@prisma/client";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useEffect, useState } from "react";
import TaskCard from "./task-card";

const EmployeeHome: React.FC = () => {
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeStaff, setActiveStaff] = useState<
    Array<{
      user: NonUser;
      fullName: string;
      role: EmployeeRole;
      contactEmail: string;
    }>
  >([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  const authorizedRequest = async (url: string, method: string) => {
    return await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    setLoadingStaff(true);

    authorizedRequest("/api/employee/my/tasks?status=incomplete", "GET")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks);
      });

    authorizedRequest("/api/employee/my/active", "GET")
      .then((res) => res.json())
      .then((data) => {
        setActiveStaff(data);
      });

    setLoading(false);
    setLoadingStaff(false);
  }, []);

  return (
    <Stack spacing={32}>
      <div>
        <Title order={3}>Tasks</Title>
        <Text color="dimmed">
          These are the tasks that you have been assigned to complete.
        </Text>
      </div>
      <ShadedCard>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={150} />
              ))
            : tasks &&
              tasks.map((task) => (
                <TaskCard key={task.id} task={task} setTasks={setTasks} />
              ))}
          {!loading && tasks.length === 0 && (
            <div className="col-span-3">
              <ModernEmptyState title="No tasks" body="You have no tasks" />
            </div>
          )}
        </div>
      </ShadedCard>
      <Divider />
      <div>
        <Title order={3}>Active Staff</Title>
        <Text color="dimmed">See who is currently active on Framework.</Text>
      </div>
      <ShadedCard>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingStaff
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={110} />
              ))
            : activeStaff &&
              activeStaff.map((staff) => (
                <Link
                  href={`/profile/${staff.user.username}`}
                  passHref
                  key={staff.user.id}
                >
                  <ShadedButton className="flex flex-col w-full">
                    <div className="flex items-center gap-4 w-full mb-4">
                      <Avatar
                        src={getMediaUrl(staff.user.avatarUri)}
                        size={32}
                        radius={999}
                      />
                      <div>
                        <Text size="lg">{staff.fullName}</Text>
                        <Text size="sm" color="dimmed">
                          @{staff.user.username}
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <Badge size="sm">{staff.role}</Badge>
                      <Text size="sm" color="dimmed">
                        {staff.contactEmail}
                      </Text>
                    </div>
                  </ShadedButton>
                </Link>
              ))}
          {!loadingStaff && activeStaff.length === 0 && (
            <div className="col-span-3">
              <ModernEmptyState
                title="No active staff"
                body="No staff are currently active"
              />
            </div>
          )}
        </div>
      </ShadedCard>
    </Stack>
  );
};

export default EmployeeHome;
