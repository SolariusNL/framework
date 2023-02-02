import {
  Avatar,
  Badge,
  Group,
  Pagination,
  Select,
  Table,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { AdminActivityLog } from "@prisma/client";
import { getCookie } from "cookies-next";
import React, { forwardRef, useEffect, useState } from "react";
import sanitize from "sanitize-html";
import getAdmins from "../../../util/fetch/getAdmins";
import getMediaUrl from "../../../util/getMedia";
import ModernEmptyState from "../../ModernEmptyState";
import ShadedButton from "../../ShadedButton";
import { marked } from "marked";

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
      `/api/admin/activity/${page}?_${
        filter.importance !== 0 ? `&importance=${filter.importance}` : ""
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
        setTotalPages(res.pages);
      });
  };

  const setFilterValue = (key: string, value: number) => {
    setPage(1);
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    retrieveActivities();
    getAdmins().then((res) => setAdmins(res));
  }, [page]);

  useEffect(() => {
    retrieveActivities();
  }, [filter]);

  return (
    <>
      <div className="flex justify-between gap-6 mb-6 flex-col md:flex-row">
        <Pagination
          radius="md"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ShadedButton
              key={activity.id}
              className="w-full flex flex-col gap-4"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={getMediaUrl(activity.user.avatarUri)}
                    size={24}
                    radius={999}
                  />
                  <Text size="sm" color="dimmed">
                    {activity.user.username}
                  </Text>
                </div>
                <div className="flex items-center gap-4">
                  <Text size="sm" color="dimmed">
                    {new Date(activity.createdAt).toLocaleString()}
                  </Text>
                  <Badge size="sm">{activity.importance}</Badge>
                </div>
              </div>

              <TypographyStylesProvider
                sx={{
                  p: {
                    margin: 0,
                  },
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitize(marked.parse(activity.activity)),
                  }}
                />
              </TypographyStylesProvider>
            </ShadedButton>
          ))
        ) : (
          <div className="col-span-full">
            <ModernEmptyState
              title="No activity"
              body="There is no activity to show."
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Activity;
