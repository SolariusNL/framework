import { Pagination, Select } from "@mantine/core";
import { EmployeeTask } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import ModernEmptyState from "../../ModernEmptyState";
import TaskCard from "./TaskCard";

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState<"incomplete" | "complete" | "all">(
    "all"
  );

  const fetchTasks = async () => {
    await fetch(
      "/api/employee/my/tasks?" +
        new URLSearchParams({
          status,
          page: String(page),
        }).toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks);
        setPages(data.pages);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [page, status]);

  return (
    <>
      <div className="flex md:items-center gap-4 md:gap-8 mb-8 flex-col md:flex-row justify-start">
        <Pagination
          total={pages}
          page={page}
          onChange={(page) => setPage(page)}
          radius="md"
        />
        <Select
          className="flex items-center gap-2"
          label="Status"
          value={status}
          onChange={(value) =>
            setStatus(value as "incomplete" | "complete" | "all")
          }
          data={[
            { label: "All", value: "all" },
            { label: "Incomplete", value: "incomplete" },
            { label: "Complete", value: "complete" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tasks && tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        {tasks.length === 0 && (
          <div className="col-span-3">
            <ModernEmptyState
              title="No tasks"
              body="You have no tasks with the given query"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;
