import { Avatar, Badge, Pagination, Table, Text } from "@mantine/core";
import { AdminActivityLog } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import getMediaUrl from "../../../util/getMedia";
import ModernEmptyState from "../../ModernEmptyState";

const Activity: React.FC = () => {
  const [activities, setActivities] = useState<
    Array<
      AdminActivityLog & {
        user: { username: string; avatarUri: string; id: number };
      }
    >
  >([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const retrieveActivities = async () => {
    await fetch(`/api/admin/activity/${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setActivities(res.activity);
      });
  };

  useEffect(() => {
    retrieveActivities();
  }, [page]);

  useEffect(() => {
    fetch("/api/admin/activitypages", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setTotalPages(res.pages);
      });
  }, []);

  return (
    <>
      <Pagination
        className="mb-2"
        radius="xl"
        page={page}
        onChange={setPage}
        total={totalPages}
      />
      <Table striped>
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Activity</th>
            <th>Importance</th>
          </tr>
        </thead>

        <tbody>
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <tr key={activity.id}>
                <td>{new Date(activity.createdAt).toLocaleString()}</td>
                <td>
                  <div className="flex gap-2 items-center">
                    <Avatar
                      size={24}
                      src={getMediaUrl(activity.user.avatarUri)}
                      radius="xl"
                    />
                    <Text weight={550} color="dimmed">
                      {activity.user.username}
                    </Text>
                  </div>
                </td>
                <td>{activity.activity}</td>
                <td>
                  <Badge>{activity.importance}</Badge>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>
                <ModernEmptyState
                  title="No activites"
                  body="No activities have been logged yet."
                />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default Activity;
