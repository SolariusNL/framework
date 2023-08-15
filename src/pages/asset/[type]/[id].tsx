import DataGrid from "@/components/data-grid";
import Framework from "@/components/framework";
import ModernEmptyState from "@/components/modern-empty-state";
import Owner from "@/components/owner";
import ShadedButton from "@/components/shaded-button";
import ShadedCard from "@/components/shaded-card";
import Stateful from "@/components/stateful";
import VerticalDivider from "@/components/vertical-divider";
import Bit from "@/icons/Bit";
import Exchange from "@/icons/Exchange";
import {
  ChartData,
  GetCatalogItemOwnershipStatusResponse,
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
  Modal,
  NumberInput,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Prisma } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import {
  HiArrowDown,
  HiArrowUp,
  HiCheck,
  HiCheckCircle,
  HiCubeTransparent,
  HiMusicNote,
  HiOutlineTag,
  HiOutlineTicket,
  HiShoppingBag,
  HiX,
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
  const [ownership, setOwnership] =
    useState<GetCatalogItemOwnershipStatusResponse["data"]>();
  const [resell, setResell] = useState({
    opened: false,
    item: null as null | {
      id: string;
      count: number;
    },
  });

  const { colors } = useMantineTheme();

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
  const setResellProp = (property: keyof typeof resell, value: any) => {
    setResell({
      ...resell,
      [property]: value,
    });
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
      fetchAndSetData<GetCatalogItemOwnershipStatusResponse>(
        `/api/catalog/sku/${assetId}/ownership-status?type=${
          type === "catalog-item"
            ? "normal"
            : type === "limited-catalog-item"
            ? "limited"
            : "sound"
        }`,
        (data) => setOwnership(data)
      ),
    ]);
  };

  useEffect(() => {
    if (type === "limited-catalog-item") fetchLimitedDetails();
  }, []);

  return (
    <Framework user={user} activeTab="none" noPadding>
      <Modal
        title="Resell item"
        opened={resell.opened}
        onClose={() => setResellProp("opened", false)}
      >
        {resell.item !== null && (
          <Stateful initialState={0}>
            {(price, setPrice) => (
              <>
                <Text size="sm" color="dimmed">
                  Please provide a price for this resell. If it is the lowest
                  price of all resellers, it will be listed as the products
                  price.
                </Text>
                <NumberInput
                  mt="lg"
                  hideControls
                  min={1}
                  value={price}
                  onChange={(value) => setPrice(value)}
                  label="Price"
                  required
                  placeholder="Enter a price in Tickets"
                />
                <div className="flex justify-end mt-6">
                  <Button
                    radius="xl"
                    leftIcon={<HiCheck />}
                    onClick={async () => {
                      await fetchJson<IResponseBase>(
                        `/api/catalog/sku/${asset.id}/sell?price=${price}&count=1&serial=${resell.item?.id}`,
                        {
                          method: "POST",
                          auth: true,
                        }
                      ).then(() => {
                        showNotification({
                          title: "Success",
                          message: "Resold item successfully",
                          icon: <HiCheckCircle />,
                        });
                        setPrice(0);
                        fetchLimitedDetails();
                        setResellProp("opened", false);
                      });
                    }}
                  >
                    Resell
                  </Button>
                </div>
              </>
            )}
          </Stateful>
        )}
      </Modal>
      <div className="w-full flex justify-center mt-12">
        <div className="max-w-2xl w-full px-4">
          <div className="flex sm:flex-row flex-col gap-8">
            <div className="w-full">
              <Avatar
                radius="md"
                src={asset.previewUri ? getMediaUrl(asset.name) : undefined}
                color={Fw.Strings.color(asset.name)}
                alt={asset.name}
                className="aspect-square w-full h-fit"
                classNames={{
                  placeholder: "p-12",
                }}
              >
                {iconPlaceholderMap[type]}
              </Avatar>
            </div>
            <div className="w-full">
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center gap-6">
                  <Title order={2}>{asset.name}</Title>
                  <Divider className="flex-grow" />
                </div>
                <div className="gap-4 items-center flex">
                  <Text color="dimmed" size="sm">
                    By
                  </Text>
                  <Owner user={asset.author} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {[
                  ...(asset.rows ?? []),
                  {
                    key: "Best price",
                    value: (
                      <>
                        <div className="flex items-center">
                          <Text
                            color="teal"
                            weight={500}
                            className="flex items-center gap-2"
                          >
                            <HiOutlineTicket />
                            <span>
                              {asset.limited
                                ? limitedPrice ?? "..."
                                : asset.price > 0
                                ? asset.price
                                : "Free"}
                            </span>
                          </Text>
                          {!asset.limited && (
                            <>
                              <VerticalDivider className="!h-4" />
                              <Text
                                color={colors.violet[4]}
                                weight={500}
                                className="flex items-center gap-2"
                              >
                                <Bit />
                                <span>
                                  {asset.priceBits > 0
                                    ? asset.priceBits
                                    : "Free"}
                                </span>
                              </Text>
                            </>
                          )}
                        </div>
                        <Button
                          color="teal"
                          mt="sm"
                          mb="md"
                          disabled={
                            !asset.onSale ||
                            (!asset.limited && ownership?.owned)
                          }
                        >
                          {asset.onSale ? "Purchase" : "Not for sale"}
                        </Button>
                      </>
                    ),
                  },
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
                    value: asset.onSale
                      ? "Available for purchase"
                      : "Not for sale",
                  },
                  {
                    key: "SKU",
                    value: asset.id,
                  },
                ]
                  .filter((row) => row.value)
                  .map((row, i) => (
                    <div className="flex gap-2" key={i}>
                      <Text
                        weight={500}
                        color="dimmed"
                        style={{ width: "30%" }}
                      >
                        {row.key}
                      </Text>
                      <Text
                        style={{
                          maxWidth: "60%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.value}
                      </Text>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {type === "limited-catalog-item" && (
            <>
              <Divider my="xl" />
              <DataGrid
                items={[
                  {
                    tooltip: "Recent price",
                    value: limitedRecentAveragePrice
                      ? `${limitedRecentAveragePrice}T$`
                      : "...",
                    icon: <Bit />,
                    hoverTip:
                      "RAP provides the current average value of a limited catalog item, based on recent sales within the past 60 days.",
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
                  chartData.map((item, i) => (
                    <ShadedButton
                      className="flex-1 text-center flex relative justify-center"
                      onClick={() => {
                        const date = new Date(item.timestamp).toLocaleString(
                          "default",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        );
                        const title = `Statistics for ${date}`;
                        const fluctuation =
                          i > 0
                            ? Math.round(item.price - chartData[i - 1].price)
                            : undefined;
                        const fluctuationText = fluctuation
                          ? `${fluctuation > 0 ? "+" : ""}${fluctuation}T$`
                          : "No data";
                        const body = (
                          <div className="flex text-center flex-col">
                            <Text size="sm" color="dimmed">
                              Fluctuation from previous month
                            </Text>
                            <Text size="sm" weight={500}>
                              {fluctuationText}
                            </Text>
                          </div>
                        );
                        openModal({
                          title,
                          children: body,
                        });
                      }}
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
                        <ThemeIcon
                          variant="light"
                          color={
                            i > 0
                              ? item.price > chartData[i - 1].price
                                ? "green"
                                : "red"
                              : "gray"
                          }
                          className="absolute top-2 right-2"
                        >
                          {i > 0 ? (
                            item.price > chartData[i - 1].price ? (
                              <HiArrowUp />
                            ) : (
                              <HiArrowDown />
                            )
                          ) : (
                            <HiX />
                          )}
                        </ThemeIcon>
                      </div>
                    </ShadedButton>
                  ))}
              </div>
              {ownership?.copies && ownership.copies.length > 0 && (
                <>
                  <Divider mt="xl" mb="xl" />
                  <Title order={3} mb="lg" className="flex items-center gap-2">
                    Your copies{" "}
                    <span>
                      <Text color="dimmed" size="sm">
                        ({ownership.copies.reduce((a, b) => a + b.count, 0)})
                      </Text>
                    </span>
                  </Title>
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                    {ownership.copies.map((copy, i) =>
                      Array.from({ length: copy.count }).map((_, j) => (
                        <ShadedCard
                          className="flex justify-center items-center flex-col text-center w-full"
                          key={i + j}
                        >
                          <Title order={4}>{asset.name}</Title>
                          {copy.count > 1 && (
                            <Text size="sm" color="dimmed">
                              Copy {j + 1} of {copy.count} of this serial
                            </Text>
                          )}
                          <DataGrid
                            items={[
                              {
                                tooltip: "Serial number",
                                value: copy.id,
                                icon: <HiOutlineTag />,
                              },
                            ]}
                            mdCols={1}
                            smCols={1}
                            defaultCols={1}
                          />
                          <Button
                            variant="subtle"
                            mt="md"
                            fullWidth
                            onClick={() => {
                              setResell({
                                opened: true,
                                item: {
                                  id: copy.id,
                                  count: copy.count,
                                },
                              });
                            }}
                          >
                            Resell
                          </Button>
                        </ShadedCard>
                      ))
                    )}
                  </div>
                </>
              )}
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
                              {new Date(
                                reseller.createdAt
                              ).toLocaleDateString()}
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
        </div>
      </div>
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
