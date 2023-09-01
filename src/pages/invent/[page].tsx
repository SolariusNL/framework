import Framework from "@/components/framework";
import LoadingIndicator from "@/components/loading-indicator";
import tabs from "@/config/invent";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import prisma from "@/util/prisma";
import { User, gameSelect } from "@/util/prisma-types";
import { Divider, NativeSelect, Tabs, Text } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface InventProps {
  user: User;
  activePage: string;
}

const Invent: NextPage<InventProps> = ({ user, activePage }) => {
  const [active, setActive] = useState(activePage || "games");
  const router = useRouter();
  const page = tabs
    .map((group) => group.children)
    .flat()
    .find((tab) => tab.name === active)?.component;

  return (
    <Framework user={user} activeTab="invent">
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar className="w-full flex-shrink-0">
          <NativeSelect
            className="md:hidden block col-span-full"
            data={tabs
              .map((group) => group.children)
              .flat()
              .map((tab) => ({
                value: tab.name,
                label: tab.tab.label,
              }))}
            value={active}
            onChange={(event) => {
              const value = event.currentTarget.value;
              if (value) {
                const tab = tabs
                  .map((group) => group.children)
                  .flat()
                  .find((tab) => tab.name === value);
                if (tab?.href) router.push(tab.href);
                else router.push(`/invent/${value}`);
              }
            }}
            size="lg"
          />
          <Tabs
            orientation="vertical"
            variant="pills"
            defaultValue="hat"
            value={active}
            onTabChange={(value) => setActive(value as string)}
            className="md:block hidden"
            classNames={{
              tab: clsx(
                "data-[active]:bg-[#f1ebff] data-[active]:text-[#631fff] data-[active]:font-semibold",
                "hover:bg-[#f1ebff]/75 hover:text-[#631fff]",
                "dark:data-[active]:bg-[#2a1d4e] dark:data-[active]:text-[#b9a5e8] dark:data-[active]:font-semibold",
                "dark:hover:bg-[#2a1d4e]/75 dark:hover:text-[#b9a5e8]",
                "transition-colors duration-50 ease-in-out"
              ),
            }}
          >
            <Tabs.List className="w-full flex flex-col gap-4">
              {tabs.map((group) => (
                <div className="flex flex-col gap-1" key={group.name}>
                  <div className="flex gap-4 items-center mb-2">
                    <Text size="sm" color="dimmed" weight={500}>
                      {group.name}
                    </Text>
                    <Divider className="flex-grow" />
                  </div>
                  {group.children.map((tab) => (
                    <Tabs.Tab
                      key={tab.name}
                      value={tab.name}
                      data-active={active === tab.name}
                      icon={
                        <span
                          className={clsx(
                            "flex items-center justify-center",
                            active !== tab.name && "text-dimmed"
                          )}
                        >
                          {tab.tab.icon}
                        </span>
                      }
                      onClick={() => {
                        if (tab.href) router.push(tab.href);
                      }}
                    >
                      {tab.tab.label}
                    </Tabs.Tab>
                  ))}
                </div>
              ))}
            </Tabs.List>
          </Tabs>
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          {page ? (
            React.createElement(page as React.ElementType, {
              user,
            })
          ) : (
            <div className="w-full flex justify-center items-center py-12">
              <LoadingIndicator />
            </div>
          )}
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false);
  if (auth.redirect) return auth;

  const { page } = context.query;
  const pageStr = typeof page === "string" ? page : "games";

  const games = await prisma.game.findMany({
    where: {
      authorId: auth.props?.user?.id,
    },
    select: gameSelect,
  });

  if (
    !tabs
      .map((group) => group.children)
      .flat()
      .find((tab) => tab.name === pageStr)
  ) {
    return {
      redirect: {
        destination: "/invent/games",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: JSON.parse(
        JSON.stringify({
          ...auth.props.user,
          games,
        })
      ),
      activePage: pageStr,
    },
  };
}

export default Invent;
