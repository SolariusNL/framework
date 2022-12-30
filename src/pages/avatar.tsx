import { Grid, ScrollArea, Skeleton, Tabs, Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { HiAdjustments, HiBeaker, HiEmojiHappy } from "react-icons/hi";
import AvatarViewer from "../components/AvatarViewer";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";
import useMediaQuery from "../util/useMediaQuery";

interface AvatarProps {
  user: User;
}

const Avatar: NextPage<AvatarProps> = ({ user }) => {
  const mobile = useMediaQuery("768");
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  return (
    <Framework
      user={user}
      activeTab="avatar"
      modernTitle="Avatar"
      modernSubtitle="Customize your avatar to your liking"
    >
      <Grid columns={6}>
        <Grid.Col span={mobile ? 6 : 2}>
          {client ? <AvatarViewer user={user} /> : <Skeleton height={300} />}
        </Grid.Col>
        <Grid.Col span={mobile ? 6 : 4}>
          <Tabs variant="pills" defaultValue="hats">
            <ScrollArea offsetScrollbars>
              <Tabs.List>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: 1,
                    marginBottom: "24px",
                  }}
                >
                  <Tabs.Tab value="hats" icon={<HiBeaker />}>
                    Hats
                  </Tabs.Tab>

                  <Tabs.Tab value="faces" icon={<HiEmojiHappy />}>
                    Faces
                  </Tabs.Tab>

                  <Tabs.Tab value="color" icon={<HiAdjustments />}>
                    Color
                  </Tabs.Tab>
                </div>
              </Tabs.List>
            </ScrollArea>

            <Tabs.Panel value="hats">
              <Title order={2} mb={16}>
                Hats
              </Title>
            </Tabs.Panel>

            <Tabs.Panel value="faces">
              <Title order={2} mb={16}>
                Faces
              </Title>
            </Tabs.Panel>

            <Tabs.Panel value="color">
              <Title order={2} mb={16}>
                Color
              </Title>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
      </Grid>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Avatar;
