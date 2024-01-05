import InventTab from "@/components/invent/invent";
import { GetDecalsResponse } from "@/pages/api/decals/[[...params]]";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import IResponseBase from "@/types/api/IResponseBase";
import cast from "@/util/cast";
import fetchJson, { fetchAndSetData } from "@/util/fetch";
import { User } from "@/util/prisma-types";
import { AssetFrontend } from "@/util/types";
import {
  Button,
  FileInput,
  Image,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import {
  HiCheck,
  HiPhotograph,
  HiTag,
  HiUpload,
  HiXCircle,
} from "react-icons/hi";
import AssetCard from "../asset-card";
import ModernEmptyState from "../modern-empty-state";

type DecalsProps = {
  user: User;
};
type Form = {
  name: string;
  description: string;
  image: File | null;
};

const Decals = ({ user }: DecalsProps) => {
  const [opened, setOpened] = useState(false);
  const [decals, setDecals] = useState<AssetFrontend[]>([]);
  const [picture, setPicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<Form>({
    initialValues: {
      name: "",
      description: "",
      image: null,
    },
    validate: {
      name: (value) => {
        if (!value) return "Name is required.";
        if (value.length > 32) return "Name must be less than 32 characters.";
      },
      description: (value) => {
        if (!value) return "Description is required.";
        if (value.length > 256)
          return "Description must be less than 256 characters.";
      },
    },
  });

  const createDecal = (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Create decal"
      className={useMantineColorScheme().colorScheme}
    >
      <Text size="sm" color="dimmed" mb="lg">
        Decals are images that can be used in games. Images are a basic building
        block of any great game, and can be used for a variety of purposes.
      </Text>
      <form
        onSubmit={form.onSubmit(async (values) => {
          setLoading(true);

          await fetchJson<
            IResponseBase<{
              decal: {
                id: string;
              };
            }>
          >("/api/decals/create", {
            method: "POST",
            body: {
              name: values.name,
              description: values.description,
            },
            auth: true,
          })
            .then(async (res) => {
              const formData = new FormData();
              formData.append("file", values.image!);
              formData.append("bucket", "decals");
              formData.append("decalId", res.data?.decal.id!);

              await fetch("/api/media/upload", {
                method: "POST",
                headers: {
                  authorization: String(getCookie(".frameworksession")),
                },
                body: formData,
              }).then(async () => {
                if (picture) {
                  formData.append("bucket", "decals");
                  formData.append("assetId", res.data?.decal.id!);

                  await fetch("/api/media/upload?type=decal", {
                    method: "POST",
                    body: formData,
                    headers: {
                      authorization: String(getCookie(".frameworksession")),
                    },
                  });
                }
                showNotification({
                  title: "Decal created",
                  message: "Your decal has been created successfully.",
                  icon: <HiCheck />,
                });
                setOpened(false);
                form.reset();
                setPicture(null);
                fetchDecals();
                setLoading(false);
              });
            })
            .catch((err) => {
              showNotification({
                title: "Failed to create decal",
                message: err.message || "An unknown error occurred.",
                color: "red",
                icon: <HiXCircle />,
              });
            });
        })}
      >
        <Stack spacing="sm">
          <TextInput
            icon={<HiTag />}
            label="Name"
            placeholder="My cool image"
            required
            classNames={BLACK}
            description="The name of your decal."
            {...form.getInputProps("name")}
          />
          <Textarea
            minRows={3}
            maxRows={6}
            label="Description"
            placeholder="This decal represents..."
            required
            classNames={BLACK}
            description="A short description of your decal."
            {...form.getInputProps("description")}
          />
          <FileInput
            variant="default"
            icon={<HiUpload />}
            placeholder="Upload image"
            label="Image file"
            description={
              <>
                The image file for your decal. You&apos;ll be able to preview
                the image before publishing.
              </>
            }
            classNames={BLACK}
            accept="image/*"
            required
            onChange={(file) => {
              form.setFieldValue("image", file);
            }}
          />
          {form.values.image && (
            <div className="my-6 flex justify-center items-center">
              <Image
                src={URL.createObjectURL(cast<File>(form.values.image))}
                alt="Decal preview"
                className="mx-auto"
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              leftIcon={<HiCheck />}
              type="submit"
              variant="light"
              radius="xl"
              loading={loading}
            >
              Create
            </Button>
          </div>
        </Stack>
      </form>
    </Modal>
  );

  const fetchDecals = async () => {
    await Promise.all([
      fetchAndSetData<GetDecalsResponse>("/api/decals/my", (data) =>
        setDecals(data?.decals || [])
      ),
    ]);
  };

  useEffect(() => {
    fetchDecals();
  }, []);

  return (
    <>
      {createDecal}
      <InventTab
        tabValue="decals"
        tabTitle="Decals"
        tabSubtitle="Create and manage your decals, and publish them to the marketplace."
        actions={
          <>
            <Button
              leftIcon={<HiPhotograph />}
              variant="default"
              onClick={() => setOpened(true)}
            >
              Create decal
            </Button>
          </>
        }
      >
        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 gap-y-8">
          {decals.length === 0 ? (
            <div className="col-span-full">
              <ModernEmptyState
                title="No decals"
                body="You haven't created any decals yet."
              />
            </div>
          ) : (
            decals.map((d) => <AssetCard key={d.id} asset={d} type="decal" />)
          )}
        </div>
      </InventTab>
    </>
  );
};

export default Decals;
