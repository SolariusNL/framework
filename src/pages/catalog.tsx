import Framework from "@/components/framework";
import ModernEmptyState from "@/components/modern-empty-state";
import Hat from "@/icons/Hat";
import Pants from "@/icons/Pants";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { Grid, Switch, Tabs } from "@mantine/core";
import { CatalogItemType } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import {
  HiCube,
  HiOutlineCog,
  HiOutlineCube,
  HiOutlineFire,
} from "react-icons/hi";

type CatalogProps = {
  user: User;
};
type Category =
  | Lowercase<CatalogItemType>
  | "models"
  | "snippets"
  | "3d-objects"
  | "sounds"
  | "textures"
  | "featured";
type Filter = {
  unavailableItems: boolean;
  limitedItems: boolean;
  lowStock: boolean;
  category: Category;
};

const DEFAULT_FILTER: Filter = {
  unavailableItems: false,
  limitedItems: true,
  lowStock: true,
  category: "featured",
};
const TABS: Array<{
  value: Category;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: "featured",
    label: "Featured",
    icon: <HiOutlineFire />,
  },
  {
    value: "3d-objects",
    label: "3D Objects",
    icon: <HiOutlineCube />,
  },
  {
    value: "gear",
    label: "Gear",
    icon: <HiOutlineCog />,
  },
  {
    value: "hat",
    label: "Hats",
    icon: <Hat />,
  },
  {
    value: "models",
    label: "Models",
    icon: <HiCube />,
  },
  {
    value: "pants",
    label: "Pants",
    icon: <Pants />,
  },
];

const Catalog: NextPage<CatalogProps> = ({ user }) => {
  const [filter, setFilter] = React.useState<Filter | undefined>(
    DEFAULT_FILTER
  );

  const changeFilterValue = (key: keyof Filter, value: any) => {
    setFilter({ ...(filter as Filter), [key as keyof Filter]: value });
  };

  return (
    <Framework
      user={user}
      activeTab="catalog"
      modernTitle="Catalog"
      modernSubtitle="Browse our catalog and find some new accessories for your avatar."
    >
      <Grid columns={24}>
        <Grid.Col span={8}>
          <Tabs
            orientation="vertical"
            variant="pills"
            defaultValue={filter?.category}
            value={filter?.category}
            onChange={(value) => changeFilterValue("category", value)}
            mb="xl"
          >
            <Tabs.List className="w-full">
              {TABS.map((tab) => (
                <Tabs.Tab key={tab.value} value={tab.value} icon={tab.icon}>
                  {tab.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
          <Switch
            label="Show unavailable items"
            checked={filter?.unavailableItems}
            onChange={(e) =>
              changeFilterValue("unavailableItems", e.target.checked)
            }
            mb="sm"
          />
          <Switch
            label="Show limited items"
            checked={filter?.limitedItems}
            onChange={(e) =>
              changeFilterValue("limitedItems", e.target.checked)
            }
          />
        </Grid.Col>
        <Grid.Col span={16}>
          <ModernEmptyState
            title="No items"
            body="No items found for your filters."
            shaded
          />
        </Grid.Col>
      </Grid>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Catalog;
