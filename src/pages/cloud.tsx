import Framework from "@/components/framework";
import ShadedCard from "@/components/shaded-card";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import useMediaQuery from "@/util/media-query";
import { User } from "@/util/prisma-types";
import { Badge, Table, Text, Title } from "@mantine/core";
import { GetServerSideProps } from "next";
import { FC } from "react";

type CloudProps = {
  user: User;
};

const Cloud: FC<CloudProps> = ({ user }) => {
  const mobile = useMediaQuery("768");

  return (
    <Framework user={user} activeTab="none">
      <div className="flex md:flex-row flex-col md:items-center justify-between gap-3 mb-4">
        <div>
          <Title order={5} className="text-dimmed">
            Your cloud
          </Title>
          <Title order={2}>Solarius Cloud</Title>
        </div>
        <div className="flex items-center justify-between gap-2">
          <ShadedCard className="flex flex-col gap-2 md:w-fit w-full">
            <Text size="sm" weight={500} color="dimmed">
              Plan
            </Text>
            <Badge size="lg" className="px-2 rounded-[4px]">
              Free (5GB)
            </Badge>
          </ShadedCard>
          <ShadedCard className="flex flex-col gap-2 md:w-fit w-full">
            <Text size="sm" weight={500} color="dimmed">
              Storage used
            </Text>
            <Title order={3}>1.00 GB</Title>
          </ShadedCard>
          <ShadedCard className="flex flex-col gap-2 md:w-fit w-full">
            <Text size="sm" weight={500} color="dimmed">
              Storage capacity
            </Text>
            <Title order={3}>5.00 GB</Title>
          </ShadedCard>
        </div>
      </div>
      <div className={clsx("flex flex-col md:flex-row w-full", "gap-8")}>
        <div className="flex-1">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>File name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded on</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>test.png</td>
                <td>PNG image</td>
                <td>3.62MB</td>
                <td>{new Date().toLocaleDateString()}</td>
              </tr>
            </tbody>
          </Table>
        </div>
        <div
          className={clsx(
            "md:flex md:flex-col md:gap-2 flex-row grid",
            "grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-3"
          )}
          {...(!mobile && { style: { width: 240 } })}
        >
          <p>Select a file</p>
        </div>
      </div>
    </Framework>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default Cloud;
