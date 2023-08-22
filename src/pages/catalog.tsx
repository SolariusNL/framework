import AssetCard from "@/components/asset-card";
import Conditional from "@/components/conditional";
import Framework from "@/components/framework";
import LabelledCheckbox from "@/components/labelled-checkbox";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import Hat from "@/icons/Hat";
import Pants from "@/icons/Pants";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import authorizedRoute from "@/util/auth";
import { fetchAndSetData } from "@/util/fetch";
import { User } from "@/util/prisma-types";
import { AssetFrontend, AssetItemType } from "@/util/types";
import {
  Divider,
  Select,
  Skeleton,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { GetServerSidePropsContext, NextPage } from "next";
import React, { useEffect } from "react";
import { HiCog, HiCubeTransparent, HiMusicNote } from "react-icons/hi";
import { TbShirt } from "react-icons/tb";
import { GetCatalogBrowseAssetsResponse } from "./api/catalog/[[...params]]";

type CatalogProps = {
  user: User;
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

const defaultFilter = {
  unavailableItems: false,
  limitedItems: true,
  search: "",
};
const groups: SidebarItemGroup[] = [
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
    ],
  },
];

const Catalog: NextPage<CatalogProps> = ({ user }) => {
  const [filter, setFilter] = React.useState(defaultFilter);
  const [tab, setTab] = React.useState<AssetItemType>("hat");
  const [assets, setAssets] = React.useState<AssetFrontend[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [debouncedSearch] = useDebouncedValue(filter.search, 150);

  const changeFilterValue = (key: keyof typeof filter, value: boolean) => {
    setFilter((current) => ({ ...current, [key]: value }));
  };

  const fetchAssets = async () => {
    setTimeout(
      async () =>
        await Promise.all([
          fetchAndSetData<GetCatalogBrowseAssetsResponse>(
            `/api/catalog/browse?type=${tab}&include_limiteds=${filter.limitedItems}&page=1&search=${debouncedSearch}`,
            (data) => setAssets(data?.assets!)
          ).finally(() => setLoading(false)),
        ]),
      500
    );
  };

  useEffect(() => {
    setLoading(true);
    setAssets([]);
    fetchAssets();
  }, [tab, filter.unavailableItems, filter.limitedItems]);

  useEffect(() => {
    fetchAssets();
  }, [debouncedSearch]);

  return (
    <Framework
      user={user}
      activeTab="catalog"
      modernTitle="Catalog"
      modernSubtitle="Browse our catalog and find some new accessories for your avatar."
    >
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar className="w-full flex-shrink-0">
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
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <Text size="sm" color="dimmed">
                    Filters
                  </Text>
                  <Divider className="flex-grow" />
                </div>
                <LabelledCheckbox
                  checked={filter.unavailableItems}
                  onChange={(event) =>
                    changeFilterValue(
                      "unavailableItems",
                      event.currentTarget.checked
                    )
                  }
                  label="Unavailable items"
                  description="Show items that are not available for purchase."
                />
                <LabelledCheckbox
                  checked={filter.limitedItems}
                  onChange={(event) =>
                    changeFilterValue(
                      "limitedItems",
                      event.currentTarget.checked
                    )
                  }
                  label="Limited items"
                  description="Show items that are limited."
                />
              </div>
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
          <TextInput
            label="Search"
            placeholder="Search for items"
            value={filter.search}
            onChange={(e) =>
              setFilter({ ...filter, search: e.currentTarget.value })
            }
            className="md:w-[40%] w-full mb-6"
          />
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
                  body="We couldn't find any items that match your filters."
                />
              </ShadedCard>
            </Conditional>
          </div>
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Catalog;
