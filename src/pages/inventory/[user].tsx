import AssetCard from "@/components/asset-card";
import Conditional from "@/components/conditional";
import Framework from "@/components/framework";
import ModernEmptyState from "@/components/modern-empty-state";
import Owner from "@/components/owner";
import ShadedCard from "@/components/shaded-card";
import Hat from "@/icons/Hat";
import Pants from "@/icons/Pants";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import useExperimentsStore, {
  ExperimentId,
} from "@/stores/useExperimentsStore";
import authorizedRoute from "@/util/auth";
import { fetchAndSetData } from "@/util/fetch";
import prisma from "@/util/prisma";
import { NonUser, User, nonCurrentUserSelect } from "@/util/prisma-types";
import { AssetFrontend, AssetItemType } from "@/util/types";
import {
  Divider,
  Select,
  Skeleton,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import { PrivacyPreferences } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { FC, useEffect, useState } from "react";
import {
  HiCog,
  HiCubeTransparent,
  HiMusicNote,
  HiPhotograph,
  HiSearch,
  HiSparkles,
} from "react-icons/hi";
import { TbShirt } from "react-icons/tb";
import { GetInventoryItemsByTypeResponse } from "../api/inventory/[[...params]]";

type InventoryProps = {
  user: User;
  viewing: NonUser;
};
type SidebarItem = {
  name: string;
  icon: JSX.Element;
  value: AssetItemType;
};
type SidebarItemGroup = {
  name: string;
  items: SidebarItem[];
};
type Sort = "lowest-price" | "highest-price";
type Filter = {
  search: string;
  sort: Sort;
};

const groups: SidebarItemGroup[] = [
  {
    name: "Special",
    items: [
      {
        value: "limiteds",
        name: "Limited items",
        icon: <HiSparkles />,
      },
    ],
  },
  {
    name: "Wearables",
    items: [
      {
        value: "hat",
        name: "Hats",
        icon: <Hat />,
      },
    ],
  },
  {
    name: "Tools",
    items: [
      {
        value: "gear",
        name: "Gear",
        icon: <HiCog />,
      },
    ],
  },
  {
    name: "Clothing",
    items: [
      {
        value: "pants",
        name: "Pants",
        icon: <Pants />,
      },
      {
        value: "shirt",
        name: "Shirts",
        icon: <TbShirt />,
      },
      {
        value: "tshirt",
        name: "T-Shirts",
        icon: <TbShirt />,
      },
    ],
  },
  {
    name: "Assets",
    items: [
      {
        value: "sound",
        name: "Sounds",
        icon: <HiMusicNote />,
      },
      {
        value: "gamepass",
        name: "Gamepasses",
        icon: <HiCubeTransparent />,
      },
      {
        value: "decal",
        name: "Decals",
        icon: <HiPhotograph />,
      },
    ],
  },
];

const Inventory: FC<InventoryProps> = ({ user, viewing }) => {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AssetItemType>("hat");
  const [assets, setAssets] = useState<AssetFrontend[]>([]);
  const [filter, setFilter] = useState<Filter>({
    search: "",
    sort: "highest-price",
  });
  const { experiments } = useExperimentsStore();

  const updateFilter = (newFilter: Partial<Filter>) =>
    setFilter({ ...filter, ...newFilter });

  const fetchAssets = async () => {
    setTimeout(
      async () =>
        await Promise.all([
          fetchAndSetData<GetInventoryItemsByTypeResponse>(
            `/api/inventory/${viewing.id}/inventory?type=${tab}`,
            (data) => setAssets(data?.items!)
          ).finally(() => setLoading(false)),
        ]),
      500
    );
  };

  useEffect(() => {
    setLoading(true);
    setAssets([]);
    fetchAssets();
  }, [tab]);

  return (
    <Framework user={user} activeTab="none">
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar className="w-full flex-shrink-0">
          <div className="mb-4 flex gap-2 flex-col">
            <Text size="sm" color="dimmed">
              Inventory of
            </Text>
            <Owner user={viewing} />
          </div>
          <Tabs
            orientation="vertical"
            variant="pills"
            defaultValue="hat"
            value={tab}
            onTabChange={(value) => setTab(value as AssetItemType)}
            className="md:block hidden"
          >
            <Tabs.List className="w-full flex flex-col gap-4">
              {groups.map((group) => (
                <div className="flex flex-col gap-2" key={group.name}>
                  <div className="flex gap-2 items-center">
                    <Text size="sm" color="dimmed">
                      {group.name}
                    </Text>
                    <Divider className="flex-grow" />
                  </div>
                  {group.items.map((tab) => (
                    <Tabs.Tab key={tab.value} icon={tab.icon} value={tab.value}>
                      {tab.name}
                    </Tabs.Tab>
                  ))}
                </div>
              ))}
            </Tabs.List>
          </Tabs>
          <Select
            size="lg"
            data={groups
              .flatMap((group) => group.items)
              .map((item) => ({
                label: item.name,
                value: item.value,
              }))}
            value={tab}
            onChange={(v) => setTab(v as AssetItemType)}
            className="md:hidden"
          />
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          <Conditional if={experiments.includes(ExperimentId.InventoryFilter)}>
            <Conditional if={assets && assets.length !== 0}>
              <div className="flex flex-col mb-6 md:flex-row md:items-center md:gap-4 gap-3 items-start">
                <TextInput
                  value={filter.search}
                  onChange={(e) =>
                    updateFilter({ search: e.currentTarget.value })
                  }
                  placeholder="Search"
                  icon={<HiSearch />}
                  label="Search for items"
                  className="w-full"
                />
                <Select
                  data={[
                    {
                      label: "Highest price",
                      value: "highest-price",
                    },
                    {
                      label: "Lowest price",
                      value: "lowest-price",
                    },
                  ]}
                  value={filter.sort}
                  onChange={(v) => updateFilter({ sort: v as Sort })}
                  label="Sort by"
                  className="md:w-[50%]"
                />
              </div>
            </Conditional>
          </Conditional>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-6 gap-4">
            <Conditional if={loading}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton height={200} key={i} />
              ))}
            </Conditional>
            <Conditional if={assets && assets.length !== 0}>
              {assets.map((asset) => (
                <AssetCard asset={asset} type={tab} key={asset.id} />
              ))}
            </Conditional>
            <Conditional if={assets && loading !== true && assets.length === 0}>
              <ShadedCard className="col-span-full">
                <ModernEmptyState
                  title="No items found"
                  body="This user has no items of this type."
                />
              </ShadedCard>
            </Conditional>
          </div>
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<{
    user: string;
  }>
) {
  const auth = await authorizedRoute(context, true, false);
  if (auth.redirect) return auth;

  const params = context.params;
  const user = params?.user;

  if (!user) return { notFound: true };

  const viewing = await prisma.user.findFirst({
    where: {
      username: user,
    },
    select: {
      ...nonCurrentUserSelect.select,
      privacyPreferences: true,
    },
  });

  if (!viewing) return { notFound: true };
  if (
    viewing.privacyPreferences.includes(PrivacyPreferences.HIDE_INVENTORY) &&
    viewing.id !== auth.props.user?.id
  )
    return { notFound: true };

  return {
    props: {
      user: auth.props.user,
      viewing: JSON.parse(
        JSON.stringify({ ...viewing, privacyPreferences: undefined })
      ),
    },
  };
}

export default Inventory;
