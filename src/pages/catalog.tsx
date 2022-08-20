import {
  Divider,
  Grid,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Title,
} from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import EmptyState from "../components/EmptyState";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { exclude } from "../util/exclude";
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
    limitedItems: false,
    lowStock: false,
    category: "hats",
  });

  const changeFilterValue = (key: keyof Filter, value: any) => {
    setFilter({ ...(filter as Filter), [key as keyof Filter]: value });
  };

  return (
    <Framework user={user} activeTab="catalog">
      <Title mb={24}>Catalog</Title>
      <Grid columns={24}>
        <Grid.Col span={16}>
          <EmptyState
            title="No items"
            body="No items found for your filters."
          />
          {JSON.stringify(filter)}
        </Grid.Col>
        <Grid.Col span={8}>
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
              onChange={(e) => changeFilterValue("lowStock", e.target.checked)}
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
        </Grid.Col>
      </Grid>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Catalog;
