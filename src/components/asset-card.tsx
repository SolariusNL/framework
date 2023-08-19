import { GetLimitedRecentAveragePriceResponse } from "@/pages/api/catalog/[[...params]]";
import { iconPlaceholderMap } from "@/pages/asset/[type]/[id]";
import { fetchAndSetData } from "@/util/fetch";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import {
  AssetFrontend,
  AssetItemType,
  AssetType,
  prismaAssetItemTypeViewMap,
} from "@/util/types";
import {
  AspectRatio,
  Avatar,
  Badge,
  Card,
  Title,
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { HiOutlineTicket } from "react-icons/hi";

type AssetCardProps = {
  asset: AssetFrontend;
  type: AssetItemType;
};

const extendedTypeMap: Record<AssetItemType, AssetType> = {
  gear: "catalog-item",
  hat: "catalog-item",
  limiteds: "limited-catalog-item",
  pants: "catalog-item",
  shirt: "catalog-item",
  tshirt: "catalog-item",
  sound: "sound",
};
const cardStyles = {
  backgroundColor: "transparent",
  cursor: "pointer",
  overflow: "visible",
  transition: "transform 0.1s",
  transform: "scale(1)",
  "&:hover": {
    transform: "scale(1.02)",
  },
  "&:active": {
    transform: "scale(0.98)",
  },
};

const AssetCard: FC<AssetCardProps> = ({ asset, type }) => {
  const [rap, setRap] = useState<number | null>(
    asset.limited ? asset.recentAveragePrice! : null
  );

  const fetchLimitedDetails = async () => {
    const assetId = asset.id;

    await Promise.all([
      fetchAndSetData<GetLimitedRecentAveragePriceResponse>(
        `/api/catalog/sku/${assetId}/rap`,
        (data) => setRap(data?.rap!)
      ),
    ]);
  };

  useEffect(() => {
    if (!asset.limited) return;
    if (
      asset.rapLastUpdated &&
      new Date(asset.rapLastUpdated) < new Date(Date.now() - 1000 * 60 * 30)
    ) {
      fetchLimitedDetails();
    }
  }, []);

  return (
    <Link
      href={`/asset/${
        type === "limiteds" || asset.limited
          ? "limited-catalog-item"
          : prismaAssetItemTypeViewMap[type as AssetItemType] || "catalog-item"
      }/${asset.id}`}
      passHref
      key={asset.id}
    >
      <Card radius="md" sx={cardStyles} component="a" p={0}>
        <Card.Section mb="md" className="relative">
          <AspectRatio ratio={1}>
            <Avatar
              radius="md"
              src={asset.previewUri ? getMediaUrl(asset.previewUri) : undefined}
              color={Fw.Strings.color(asset.name)}
              alt={asset.name}
              className="aspect-square w-full h-fit"
              classNames={{
                placeholder: "p-12",
              }}
            >
              {
                iconPlaceholderMap[
                  extendedTypeMap[type as AssetItemType] || type
                ]
              }
            </Avatar>
          </AspectRatio>
          <div className="absolute bottom-2 left-2 flex items-center justify-center">
            {asset.limited ? (
              <Tooltip label="Limited item. Price shown is recent average price and not representative of the actual price.">
                <Badge
                  variant="gradient"
                  gradient={{
                    from: "pink",
                    to: "purple",
                  }}
                  radius="sm"
                  className="opacity-50"
                >
                  Limited
                </Badge>
              </Tooltip>
            ) : null}
          </div>
        </Card.Section>
        <div className="flex justify-between mb-4">
          <Title order={4}>{asset.name}</Title>
        </div>
        <div className="flex justify-between items-center w-full">
          <div>
            <Badge color="teal" radius="sm" className="px-1.5" size="lg">
              <div className="flex items-center gap-2">
                <HiOutlineTicket />
                <span>
                  {asset.limited
                    ? rap
                      ? Fw.Nums.beautify(rap)
                      : "..."
                    : asset.price > 0
                    ? asset.price
                    : "Free"}
                </span>
              </div>
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default AssetCard;
