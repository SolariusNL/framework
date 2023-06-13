import { Button, Checkbox, Divider, Grid, Stack, Switch } from "@mantine/core";
import { CatalogItemType } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import { HiX } from "react-icons/hi";
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
  category: CatalogItemType | "all";
}

const defaultFilter: Filter = {
  unavailableItems: false,
  limitedItems: true,
  lowStock: true,
  category: "all",
};

const Catalog: NextPage<CatalogProps> = ({ user }) => {
  const [filter, setFilter] = React.useState<Filter | undefined>(defaultFilter);

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
          <ShadedCard title="Filters">
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
              <Divider my="md" />
              <Stack spacing="xs">
                {[
                  { label: "Hats", value: CatalogItemType.HAT },
                  { label: "Gear", value: CatalogItemType.GEAR },
                  { label: "Shirts", value: CatalogItemType.SHIRT },
                  { label: "T-Shirts", value: CatalogItemType.TSHIRT },
                  { label: "Pants", value: CatalogItemType.PANTS },
                ].map((item) => (
                  <Checkbox
                    label={item.label}
                    radius="xl"
                    value={item.value}
                    key={item.value}
                    checked={filter?.category === item.value}
                    onChange={(e) =>
                      changeFilterValue("category", e.target.value)
                    }
                  />
                ))}
              </Stack>
            </Stack>
            {filter !== defaultFilter && (
              <Button
                mt="md"
                fullWidth
                leftIcon={<HiX />}
                variant="light"
                onClick={() => {
                  setFilter(defaultFilter);
                }}
              >
                Clear filters
              </Button>
            )}
          </ShadedCard>
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
