import Framework from "@/components/framework";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import { User } from "@/util/prisma-types";
import { Anchor, Button, Divider, Text, Title } from "@mantine/core";
import { GetServerSideProps } from "next";
import { FC } from "react";
import { FaApple, FaLinux, FaWindows } from "react-icons/fa";
import { HiOutlineDownload, HiOutlineLogin } from "react-icons/hi";

type CommunityProps = {
  user: User;
};

const platforms = [
  {
    name: "Linux",
    icon: <FaLinux />,
    tip: ".appimage",
    download: "https://cloud.solarius.me/index.php/s/iDyRQrmpmygL44C/download",
  },
  {
    name: "macOS",
    icon: <FaApple />,
    tip: ".dmg",
    download: "https://cloud.solarius.me/index.php/s/qiQdZNMASbp7rp5/download",
  },
  {
    name: "Windows",
    icon: <FaWindows />,
    tip: ".exe",
    download: "https://cloud.solarius.me/index.php/s/agwRCAo2PpxaFHt/download",
  },
];

const Community: FC<CommunityProps> = ({ user }) => {
  return (
    <Framework activeTab="none" user={user}>
      <div className="w-full flex justify-center mt-12">
        <div className="max-w-xl w-full px-4">
          <Title order={3} mb="sm">
            Solarius Community
          </Title>
          <Text size="sm" color="dimmed">
            Want to get involved with the Solarius community? Join our
            self-managed Revolt instance to chat with other users, get support,
            and more!
          </Text>
          <Divider my={32} />
          <Title order={4} mb="sm">
            Revolt website
          </Title>
          <Text size="sm" color="dimmed">
            The easiest way to join the Solarius community is to visit the
            website at{" "}
            <Anchor href="https://revolt.solarius.me">
              https://revolt.solarius.me
            </Anchor>
            . An account is required to use Revolt.
          </Text>
          <Title order={4} mt={32} mb="sm">
            Join the server
          </Title>
          <Text size="sm" color="dimmed">
            If you already have a Revolt account, you can join the server by
            clicking the button below.
          </Text>
          <a href="https://revolt.solarius.me/invite/sWm6yMMP">
            <Button
              radius="xl"
              variant="light"
              className="mt-4"
              leftIcon={<HiOutlineLogin />}
            >
              Join the server
            </Button>
          </a>
          <Title order={4} mt={32} mb="sm">
            Revolt desktop app
          </Title>
          <Text size="sm" color="dimmed">
            We provide a desktop app for Revolt that can be downloaded for easy
            access to the community. The app is available for Windows, macOS,
            and Linux.
          </Text>
          <div
            className={clsx(
              "mt-12 flex gap-8 text-center justify-between",
              "flex-col md:flex-row md:flex-wrap"
            )}
          >
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className={clsx(
                  "flex flex-col flex-1 items-center justify-center"
                )}
              >
                <div className="text-4xl">{platform.icon}</div>
                <Text mt="sm">{platform.name}</Text>
                <Text size="sm" mt="xs" color="dimmed">
                  {platform.tip}
                </Text>
                <a href={platform.download}>
                  <Button
                    radius="xl"
                    variant="light"
                    className="mt-4"
                    leftIcon={<HiOutlineDownload />}
                  >
                    Download
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Framework>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await authorizedRoute(ctx, false, false);
  if (auth.redirect) return auth;

  return auth;
};

export default Community;
