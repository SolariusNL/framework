import DataGrid from "@/components/data-grid";
import Framework from "@/components/framework";
import ModernEmptyState from "@/components/modern-empty-state";
import Owner from "@/components/owner";
import ShadedButton from "@/components/shaded-button";
import ShadedCard from "@/components/shaded-card";
import VerticalDivider from "@/components/vertical-divider";
import Bit from "@/icons/Bit";
import Exchange from "@/icons/Exchange";
import {
  ChartData,
  GetChartDataResponse,
  GetLimitedPriceResponse,
  GetLimitedRecentAveragePriceResponse,
  GetResellersResponse,
  LimitedCatalogItemResellWithSeller,
} from "@/pages/api/catalog/[[...params]]";
import IResponseBase from "@/types/api/IResponseBase";
import authorizedRoute from "@/util/auth";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import prisma from "@/util/prisma";
import { User, nonCurrentUserSelect } from "@/util/prisma-types";
import { AssetFrontend, PascalToCamel } from "@/util/types";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { Prisma } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import {
  HiCubeTransparent,
  HiMusicNote,
  HiOutlineTicket,
  HiShoppingBag,
} from "react-icons/hi";

type AssetViewProps = {
  asset: AssetFrontend;
  user: User;
  type: AssetType;
};
type AssetType = "catalog-item" | "limited-catalog-item" | "sound";

const prismaAssetTypeMap: Record<AssetType, PascalToCamel<Prisma.ModelName>> = {
  "catalog-item": "catalogItem",
  "limited-catalog-item": "limitedCatalogItem",
  sound: "sound",
};
const iconPlaceholderMap: Record<AssetType, JSX.Element> = {
  "catalog-item": <HiCubeTransparent className="w-full h-full aspect-square" />,
  "limited-catalog-item": (
    <HiCubeTransparent className="w-full h-full aspect-square" />
  ),
  sound: <HiMusicNote className="w-full h-full aspect-square" />,
};

const AssetView: React.FC<AssetViewProps> = ({ asset, user, type }) => {
  const [limitedPrice, setLimitedPrice] = useState<number>();
  const [limitedRecentAveragePrice, setLimitedRecentAveragePrice] =
    useState<number>();
  const [chartData, setChartData] = useState<ChartData[]>();
  const [resellers, setResellers] =
    useState<LimitedCatalogItemResellWithSeller[]>();

  const { colors, colorScheme } = useMantineTheme();

  const fetchAndSetData = async <T extends IResponseBase>(
    url: string,
    setData: (data: T["data"]) => void
  ) => {
    const response = await fetchJson<{ success: boolean; data?: T }>(url, {
      method: "GET",
      auth: true,
    });

    if (response.success) {
      setData(response.data!);
    }
  };

  const fetchLimitedDetails = async () => {
    const assetId = asset.id;

    await Promise.all([
      fetchAndSetData<GetLimitedRecentAveragePriceResponse>(
        `/api/catalog/sku/${assetId}/rap`,
        (data) => setLimitedRecentAveragePrice(data?.rap!)
      ),
      fetchAndSetData<GetLimitedPriceResponse>(
        `/api/catalog/sku/${assetId}/price`,
        (data) => setLimitedPrice(data?.price!)
      ),
      fetchAndSetData<GetChartDataResponse>(
        `/api/catalog/sku/${assetId}/chart-data`,
        (data) => setChartData(data?.data!)
      ),
      fetchAndSetData<GetResellersResponse>(
        `/api/catalog/sku/${assetId}/resellers`,
        (data) => setResellers(data?.resellers!)
      ),
    ]);
  };

  useEffect(() => {
    if (type === "limited-catalog-item") fetchLimitedDetails();
  }, []);

  return (
    <Framework user={user} activeTab="none">
      <div className="flex sm:flex-row flex-col gap-8">
        <div className="sm:w-2/6 w-full">
          <Avatar
            radius="md"
            src={asset.previewUri ? getMediaUrl(asset.name) : undefined}
            color={Fw.Strings.color(asset.name)}
            alt={asset.name}
            style={{ width: "100%", height: "100%" }}
            className="aspect-square"
            classNames={{
              placeholder: "p-12",
            }}
          >
            {iconPlaceholderMap[type]}
          </Avatar>
        </div>
        <div className="sm:w-4/6 w-full">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-6">
              <Title order={2}>{asset.name}</Title>
              <Divider className="flex-grow" />
            </div>
            <div className="justify-between items-center flex gap-4">
              <Owner user={asset.author} />
              <div className="flex items-center gap-8">
                <div className="flex items-center">
                  <Text
                    color="teal"
                    weight={500}
                    className="flex items-center gap-2"
                  >
                    <HiOutlineTicket />
                    <span>
                      {asset.limited ? limitedPrice ?? "..." : asset.price}
                    </span>
                  </Text>
                  {!asset.limited && (
                    <>
                      <VerticalDivider />
                      <Text
                        color={colors.violet[4]}
                        weight={500}
                        className="flex items-center gap-2"
                      >
                        <Bit />
                        <span>{asset.priceBits}</span>
                      </Text>
                    </>
                  )}
                </div>
                <Button color="teal" size="lg" disabled={!asset.onSale}>
                  {asset.onSale ? "Purchase" : "Not for sale"}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {[
              ...(asset.rows ?? []),
              {
                key: "Created at",
                value: new Date(asset.createdAt).toLocaleDateString(),
              },
              {
                key: "Stargazers",
                value: `${asset._count.stargazers} ${Fw.Strings.pluralize(
                  asset._count.stargazers,
                  "stargazer"
                )}`,
              },
              {
                key: "Limited",
                value: asset.limited ? "Limited item" : "Regular item",
              },
              {
                key: "On sale",
                value: asset.onSale ? "Available for purchase" : "Not for sale",
              },
            ]
              .filter((row) => row.value)
              .map((row, i) => (
                <div className="flex gap-2" key={i}>
                  <Text weight={500} color="dimmed" style={{ width: "20%" }}>
                    {row.key}
                  </Text>
                  <Text>{row.value}</Text>
                </div>
              ))}
          </div>
        </div>
      </div>
      {type === "limited-catalog-item" && (
        <>
          <DataGrid
            items={[
              {
                tooltip: "Recent price",
                value: limitedRecentAveragePrice
                  ? `${limitedRecentAveragePrice}T$`
                  : "...",
                icon: <Bit />,
              },
              {
                tooltip: "Stock",
                value: asset.stock,
                icon: <HiShoppingBag />,
              },
              {
                tooltip: "Quantity sold",
                value: asset.quantitySold,
                icon: <Exchange />,
              },
            ]}
          />
          <div className="md:flex grid mt-8 grid-cols-2 gap-2 md:flex-row overflow-x-auto">
            {chartData &&
              chartData
                .slice(0)
                .reverse()
                .map((item, i) => (
                  <ShadedButton
                    className="flex-1 text-center flex justify-center"
                    key={i}
                  >
                    <div className="flex flex-col gap-2">
                      <Text weight={500} color="dimmed">
                        {new Date(item.timestamp).toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                      <Text weight={"bold"}>
                        {item.price ? `${Math.round(item.price)}T$` : "..."}
                      </Text>
                    </div>
                  </ShadedButton>
                ))}
          </div>
          {asset.stock === 0 && (
            <>
              <Divider mt="xl" mb="xl" />
              <Title order={3} mb="lg">
                Resellers
              </Title>
              {resellers && resellers.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {resellers.map((reseller, i) => (
                    <ShadedButton
                      className="flex-1 text-center flex justify-between items-center"
                      key={i}
                    >
                      <Owner user={reseller.seller} />
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                          <Title order={4}>{asset.name}</Title>
                          <Badge color="pink">Limited</Badge>
                        </div>
                        <Text size="sm" color="dimmed">
                          {new Date(reseller.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                      <Text
                        color="teal"
                        className="items-center flex gap-2"
                        weight={500}
                      >
                        <Bit />
                        <span>{reseller.price}</span>
                      </Text>
                    </ShadedButton>
                  ))}
                </div>
              ) : (
                <ShadedCard className="flex justify-center">
                  <ModernEmptyState
                    title="No resellers"
                    body="No resellers have been found for this item. If the item is in stock, you can purchase it from the catalog - or resell it yourself!"
                  />
                </ShadedCard>
              )}
            </>
          )}
        </>
      )}
    </Framework>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<{
    id: string;
    type: AssetType;
  }>
) {
  const auth = await authorizedRoute(context, true, false);
  if (auth.redirect) return auth;

  const params = context.params;
  const id = params?.id;
  const type = params?.type;

  if (!id) return { notFound: true };
  if (!type) return { notFound: true };
  if (!Object.keys(prismaAssetTypeMap).includes(type))
    return { notFound: true };

  const queryExecutor = prisma[prismaAssetTypeMap[type]] as never as {
    findUnique: (args: Prisma.CatalogItemFindUniqueArgs) => Promise<any>;
  };

  const asset = await queryExecutor.findUnique({
    where: {
      id: id,
    },
    include: {
      _count: {
        select: {
          stargazers: true,
        },
      },
      author: {
        select: nonCurrentUserSelect.select,
      },
    },
  });

  return {
    props: {
      user: auth.props?.user ?? null,
      asset: JSON.parse(JSON.stringify(asset)),
      type,
    },
  };
}

export default AssetView;
