import Framework from "@/components/framework";
import ImageUploader from "@/components/image-uploader";
import LabelledCheckbox from "@/components/labelled-checkbox";
import Owner from "@/components/owner";
import IResponseBase from "@/types/api/IResponseBase";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import prisma from "@/util/prisma";
import { User, nonCurrentUserSelect } from "@/util/prisma-types";
import { AssetFrontend, AssetType, prismaAssetTypeMap } from "@/util/types";
import {
  Avatar,
  Button,
  NumberInput,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Prisma } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  HiCheckCircle,
  HiOutlineCamera,
  HiOutlineCheck,
  HiOutlineTicket,
} from "react-icons/hi";
import { iconPlaceholderMap } from ".";

type AssetViewProps = {
  asset: AssetFrontend;
  user: User;
  type: AssetType;
};
type ChangeableFields =
  | "name"
  | "description"
  | "previewUri"
  | "price"
  | "onSale";

const AssetView: React.FC<AssetViewProps> = ({
  asset: assetInitial,
  user,
  type,
}) => {
  const [asset, setAsset] = useState(assetInitial);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const changeField = (
    field: ChangeableFields,
    value: string | number | boolean
  ) => {
    setAsset((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveDataRequest = async (previewUri?: string) => {
    await fetchJson<IResponseBase>(
      `/api/catalog/sku/${asset.id}/edit?type=${type}`,
      {
        method: "PATCH",
        auth: true,
        body: {
          name: asset.name,
          description: asset.description,
          price: asset.price,
          onSale: asset.onSale,
          ...(previewUri ? { previewUri } : {}),
        },
      }
    ).finally(() =>
      showNotification({
        title: "Saved",
        message: "Your changes have been saved.",
        icon: <HiCheckCircle />,
      })
    );
  };

  const save = async () => {
    if (uploaded) {
      const formData = new FormData();
      const file = new File(
        [
          Buffer.from(
            String(uploaded).replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          ),
        ],
        "asset.jpeg",
        {
          type: "image/jpeg",
        }
      );
      formData.append("file", file);
      formData.append("bucket", "assets");
      formData.append("assetId", asset.id);

      await fetch(`/api/media/upload?type=${type}`, {
        method: "POST",
        body: formData,
        headers: {
          authorization: String(getCookie(".frameworksession")),
        },
      })
        .then((res) => res.json())
        .then(async (res: { icon: string }) => {
          await saveDataRequest(res.icon);
        });
    } else {
      await saveDataRequest();
    }
  };

  return (
    <Framework user={user} activeTab="none" noPadding>
      <div className="w-full flex justify-center mt-12">
        <div className="max-w-2xl w-full px-4">
          <div className="flex sm:flex-row flex-col gap-8">
            <div className="w-full relative h-fit group">
              <Avatar
                radius="md"
                src={
                  asset.previewUri ? getMediaUrl(asset.previewUri) : undefined
                }
                color={Fw.Strings.color(asset.name)}
                alt={asset.name}
                className="aspect-square w-full h-fit"
                classNames={{
                  placeholder: "p-12",
                }}
                ref={imageRef}
              >
                {iconPlaceholderMap[type]}
              </Avatar>
              <ImageUploader
                button={
                  <div
                    className={clsx(
                      "bg-zinc-800/50 rounded-md cursor-pointer transition-all opacity-0 group-hover:opacity-100 flex absolute top-0 left-0 w-full h-full items-center justify-center",
                      "h-fit"
                    )}
                  >
                    <HiOutlineCamera className="w-12 h-12 text-white" />
                  </div>
                }
                onFinished={(imgStr) => {
                  setUploaded(imgStr);
                  changeField("previewUri", imgStr);
                }}
                crop
                ratio={1}
                imgRef={imageRef}
              />
            </div>

            <div className="w-full">
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center gap-6">
                  <TextInput
                    size="lg"
                    classNames={{
                      input: "bg-transparent",
                    }}
                    className="w-full"
                    value={asset.name}
                    onChange={(e) => changeField("name", e.currentTarget.value)}
                  />
                </div>
                <div className="gap-4 items-center flex">
                  <Text color="dimmed" size="sm">
                    By
                  </Text>
                  <Owner user={asset.author} />
                </div>
              </div>
              <NumberInput
                icon={<HiOutlineTicket />}
                value={asset.price}
                onChange={(value: number) =>
                  changeField("price", Number(value))
                }
                classNames={{
                  input: "bg-transparent",
                }}
                className="w-[50%]"
                min={1}
              />
              <div className="my-4">
                <LabelledCheckbox
                  label="For sale"
                  description="This asset will be available for purchase."
                  checked={asset.onSale}
                  onChange={(e) =>
                    changeField("onSale", e.currentTarget.checked)
                  }
                  black
                />
              </div>
              <Textarea
                className="my-4"
                classNames={{
                  input: "bg-transparent",
                }}
                value={asset.description}
                onChange={(e) =>
                  changeField("description", e.currentTarget.value)
                }
              />
              <div className="flex justify-end gap-2">
                <Link
                  href="/asset/[type]/[id]"
                  as={`/asset/${type}/${asset.id}`}
                >
                  <Button radius="xl" variant="subtle" color="gray">
                    Back to asset
                  </Button>
                </Link>
                <Button
                  radius="xl"
                  variant="light"
                  leftIcon={<HiOutlineCheck />}
                  onClick={save}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
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

  if (!id) return { redirect: { destination: "/catalog", permanent: false } };
  if (!type) return { redirect: { destination: "/catalog", permanent: false } };
  if (!Object.keys(prismaAssetTypeMap).includes(type))
    return { redirect: { destination: "/catalog", permanent: false } };

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
      rows: true,
    },
  });

  if (!asset.canAuthorEdit)
    return {
      redirect: {
        destination: `/asset/${type}/${id}`,
        permanent: false,
      },
    };
  if (asset.authorId !== auth.props?.user?.id)
    return {
      redirect: {
        destination: `/asset/${type}/${id}`,
        permanent: false,
      },
    };

  return {
    props: {
      user: auth.props?.user ?? null,
      asset: JSON.parse(JSON.stringify(asset)),
      type,
    },
  };
}

export default AssetView;
