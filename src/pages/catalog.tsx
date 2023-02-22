import { Divider, Grid, SegmentedControl, Stack, Switch } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import ShadedCard from "../components/ShadedCard";
import authorizedRoute from "../util/auth";
import { User } from "../util/prisma-types";

interface CatalogProps {
  user: User;
}

interface Filter {
  unavailableItems: boolean;
  limitedItems: boolean;
  lowStock: boolean;
  category: "hats" | "faces" | "shirts" | "pants";
}

const Catalog: NextPage<CatalogProps> = ({ user }) => {
  const [filter, setFilter] = React.useState<Filter | undefined>({
    unavailableItems: false,
    limitedItems: true,
    lowStock: true,
    category: "hats",
  });

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
        <Grid.Col span={16}>
          <ModernEmptyState
            title="No items"
            body="No items found for your filters."
            shaded
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <ShadedCard title="Filters" titleWithBorder>
            <Stack spacing={10}>
              <Switch
                label="Show unavailable items"
                checked={filter?.unavailableItems}
                onChange={(e) =>
                  changeFilterValue("unavailableItems", e.target.checked)
                }
              />
              <Switch
                label="Show limited items"
                checked={filter?.limitedItems}
                onChange={(e) =>
                  changeFilterValue("limitedItems", e.target.checked)
                }
              />
              <Switch
                label="Show items with low stock"
                checked={filter?.lowStock}
                onChange={(e) =>
                  changeFilterValue("lowStock", e.target.checked)
                }
              />
              <Divider mt={15} mb={15} />
              <SegmentedControl
                data={[
                  { label: "Hats", value: "hats" },
                  { label: "Faces", value: "faces" },
                  { label: "Shirts", value: "shirts" },
                  { label: "Pants", value: "pants" },
                ]}
                onChange={(v) =>
                  changeFilterValue("category", v as Filter["category"])
                }
                value={filter?.category}
              />
            </Stack>
          </ShadedCard>
        </Grid.Col>
      </Grid>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Catalog;
