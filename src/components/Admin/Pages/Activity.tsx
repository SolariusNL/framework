import {
  Avatar,
  Badge,
  Group,
  Pagination,
  Select,
  Table,
  Text,
} from "@mantine/core";
import { AdminActivityLog } from "@prisma/client";
import { getCookie } from "cookies-next";
import React, { forwardRef, useEffect, useState } from "react";
import getAdmins from "../../../util/fetch/getAdmins";
import getMediaUrl from "../../../util/getMedia";
import ModernEmptyState from "../../ModernEmptyState";

interface UserItemProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  avatar: string;
}

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
  const [filter, setFilter] = useState<{
    importance?: number;
    userId?: number;
  }>({ importance: 0, userId: 0 });
  const [admins, setAdmins] = useState<
    Array<{ username: string; avatarUri: string; id: number }>
  >([]);

  const retrieveActivities = async () => {
    await fetch(
      `/api/admin/activity/${page}${
        filter.importance !== 0 ? `?importance=${filter.importance}` : ""
      }${filter.userId !== 0 ? `&userId=${filter.userId}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setActivities(res.activity);
      });
  };

  const setFilterValue = (key: string, value: number) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  useEffect(() => {
    retrieveActivities();
    getAdmins().then((res) => setAdmins(res));
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

  useEffect(() => {}, [filter]);

  return (
    <>
      <div className="flex justify-between gap-6 mb-6 flex-col md:flex-row">
        <Pagination
          radius="xl"
          page={page}
          onChange={setPage}
          total={totalPages}
        />
        <div className="flex items-center gap-2 justify-between md:justify-end">
          <Select
            data={Array.from(Array(5).keys())
              .map((i) => ({
                label: String(i + 1),
                value: String(i + 1),
              }))
              .concat([{ label: "All", value: "0" }])}
            label="Importance"
            placeholder="Importance filter"
            value={String(filter.importance)}
            onChange={(n) => {
              setFilterValue("importance", Number(n));
            }}
          />
          <Select
            data={admins
              .map((admin) => ({
                label: admin.username,
                value: String(admin.id),
                avatar: admin.avatarUri,
              }))
              .concat([{ label: "All", value: "0", avatar: "" }])}
            label="User"
            placeholder="User filter"
            itemComponent={forwardRef<HTMLDivElement, UserItemProps>(
              ({ avatar, label, ...others }: UserItemProps, ref) => (
                <Group noWrap ref={ref} {...others}>
                  <Avatar size={24} src={getMediaUrl(avatar)} radius={999} />
                  <Text>{label}</Text>
                </Group>
              )
            )}
            value={String(filter.userId)}
            onChange={(n) => {
              setFilterValue("userId", Number(n));
            }}
          />
        </div>
      </div>
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
            activities
              .filter((activity) => {
                if (filter.importance === 0) return true;
                return activity.importance === filter.importance;
              })
              .filter((activity) => {
                if (filter.userId === 0) return true;
                return activity.userId === filter.userId;
              })
              .map((activity) => (
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
