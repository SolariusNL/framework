import { Divider, Skeleton, Stack, Title } from "@mantine/core";
import { EmployeeTask } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import ModernEmptyState from "../../ModernEmptyState";
import ShadedCard from "../../ShadedCard";
import TaskCard from "./TaskCard";

const EmployeeHome: React.FC = () => {
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/employee/my/tasks?status=incomplete", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks);
      });
    setLoading(false);
  }, []);

  return (
    <Stack spacing={32}>
      <Title order={3}>Tasks</Title>
      <ShadedCard>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={150} />
              ))
            : tasks &&
              tasks.map((task) => <TaskCard key={task.id} task={task} />)}
          {!loading && tasks.length === 0 && (
            <div className="col-span-3">
              <ModernEmptyState title="No tasks" body="You have no tasks" />
            </div>
          )}
        </div>
      </ShadedCard>
    </Stack>
  );
};

export default EmployeeHome;
