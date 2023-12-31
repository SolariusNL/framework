import { AdminViewUser } from "@/components/admin/pages/users";
import ModernEmptyState from "@/components/modern-empty-state";
import Owner from "@/components/owner";
import clsx from "@/util/clsx";
import { ActionIcon, Divider, ScrollArea, Text } from "@mantine/core";
import { PunishmentType } from "@prisma/client";
import { FC, useRef, useState } from "react";
import { HiArrowSmDown } from "react-icons/hi";

type PunishmentHistoryProps = {
  user: AdminViewUser;
  scroll?: boolean;
  scrollH?: string;
  className?: string;
  style?: React.CSSProperties;
};

const PunishmentHistory: FC<PunishmentHistoryProps> = ({
  user,
  scroll,
  scrollH,
  className,
  style,
}) => {
  const historyRef = useRef<HTMLDivElement>(null);
  const [didScroll, setDidScroll] = useState(false);

  const entries = user.punishmentHistory
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map((p, i) => (
      <>
        {i !== 0 && <Divider my="md" />}

        <div>
          <Owner user={p.punishedBy} />
          <Text size="lg" mt="sm" weight={500}>
            {p.type === PunishmentType.WARNING
              ? "Warning"
              : p.type === PunishmentType.BAN
              ? "Ban"
              : "HWID Ban"}{" "}
            - {new Date(p.createdAt).toLocaleDateString()}
          </Text>
          <Text size="sm" color="dimmed" mt="md">
            User-facing reason
          </Text>
          <Text size="sm" mt={4}>
            {p.reason}
          </Text>
          <Text size="sm" color="dimmed" mt="md">
            Internal note
          </Text>
          <Text size="sm" mt={4}>
            {p.internalNote ||
              "No internal note provided. (possibly before this feature was added)"}
          </Text>
        </div>
      </>
    ));

  return (
    <>
      {user.punishmentHistory.length > 0 ? (
        scroll ? (
          <ScrollArea
            sx={{
              height: scrollH || "15rem",
            }}
            className={className}
            onScrollPositionChange={() => setDidScroll(true)}
            viewportRef={historyRef}
          >
            {!didScroll && user.punishmentHistory.length > 3 && (
              <div
                className={clsx(
                  "absolute bottom-0 left-0 right-0 flex justify-center animate-bounce"
                )}
              >
                <ActionIcon
                  className="dark:bg-zinc-900/50 bg-gray-500/50 text-gray-100"
                  radius={999}
                >
                  <HiArrowSmDown />
                </ActionIcon>
              </div>
            )}
            {entries}
          </ScrollArea>
        ) : (
          entries
        )
      ) : (
        <ModernEmptyState
          title="No punishments"
          body="This user has no punishment history!"
        />
      )}
    </>
  );
};

export default PunishmentHistory;
