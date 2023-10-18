import Conditional from "@/components/conditional";
import Descriptive from "@/components/descriptive";
import EditGameTab from "@/components/edit-game/edit-game-tab";
import ImageUploader from "@/components/image-uploader";
import { GetGameGamepassesResponse } from "@/pages/api/experiences/[[...params]]";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import { fetchAndSetData } from "@/util/fetch";
import { Game } from "@/util/prisma-types";
import { AssetFrontend } from "@/util/types";
import {
  Button,
  Image,
  Modal,
  NumberInput,
  Skeleton,
  Text,
  Textarea,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Gamepass } from "@prisma/client";
import { getCookie } from "cookies-next";
import React, { useEffect, useState } from "react";
import {
  HiCheckCircle,
  HiInbox,
  HiPlus,
  HiTicket,
  HiXCircle,
} from "react-icons/hi";
import AssetCard from "../asset-card";
import ModernEmptyState from "../modern-empty-state";
import ShadedButton from "../shaded-button";
import ShadedCard from "../shaded-card";

interface StoreProps {
  game: Game & {
    gamepasses: Array<
      Gamepass & {
        owners: Array<{ id: number }>;
      }
    >;
  };
}

interface GamepassForm {
  name: string;
  description: string;
  price: number;
  icon: string;
}

const Store: React.FC<StoreProps> = ({ game }) => {
  const form = useForm<GamepassForm>({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      icon: "",
    },
    validate: {
      name: (value) => {
        if (!value) return "Name is required";
        if (value.length > 64) return "Name must be less than 64 characters";
      },
      description: (value) => {
        if (!value) return "Description is required";
        if (value.length > 300)
          return "Description must be less than 300 characters";
      },
      price: (value) => {
        if (value < 0) return "Price must be greater than 0";
        if (value > 1000000) return "Price must be less than 1 million";
      },
      icon: (value) => {
        if (!value) return "Icon is required";
      },
    },
  });
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const { colorScheme } = useMantineColorScheme();
  const [gamepasses, setGamepasses] = useState<AssetFrontend[]>([]);
  const [opened, setOpened] = useState(false);

  const fetchData = async () => {
    await Promise.all([
      fetchAndSetData<GetGameGamepassesResponse>(
        `/api/experiences/${game.id}/gamepasses`,
        (data) => setGamepasses(data?.gamepasses!)
      ),
    ]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create a new gamepass"
        className={colorScheme}
      >
        <form
          onSubmit={form.onSubmit(async (values) => {
            await fetch(`/api/games/${game.id}/gamepass/new`, {
              method: "POST",
              body: JSON.stringify(values),
              headers: {
                "Content-Type": "application/json",
                Authorization: String(getCookie(".frameworksession")),
              },
            })
              .then(async (res) => res.json())
              .then(async (res) => {
                if (res.success) {
                  showNotification({
                    title: "Created gamepass",
                    message: "Your gamepass has been created successfully",
                    icon: <HiCheckCircle />,
                  });
                  setOpened(false);
                  setGamepasses((prev: any) => [
                    ...prev,
                    res.gamepass as Gamepass,
                  ]);

                  const formData = new FormData();
                  const file = new File(
                    [
                      Buffer.from(
                        values.icon.replace(/^data:image\/\w+;base64,/, ""),
                        "base64"
                      ),
                    ],
                    "gamepass.jpeg",
                    {
                      type: "image/jpeg",
                    }
                  );

                  formData.append("file", file);
                  formData.append("assetId", res.gamepass.id.toString());
                  formData.append("bucket", "assets");

                  await fetch("/api/media/upload?type=sounds", {
                    method: "POST",
                    headers: {
                      authorization: String(getCookie(".frameworksession")),
                    },
                    body: formData,
                  }).catch((err) => {
                    showNotification({
                      title: "Failed to upload icon",
                      message: "Failed to upload icon. Please try again.",
                      icon: <HiXCircle />,
                    });
                  });
                }
              })
              .finally(() => {
                form.reset();
              });
          })}
        >
          <TextInput
            label="Name"
            description="The name of the gamepass"
            required
            mb="md"
            placeholder="VIP"
            classNames={BLACK}
            icon={<HiInbox />}
            {...form.getInputProps("name")}
          />
          <Textarea
            label="Description"
            description="The description of the gamepass, what it grants the user, etc."
            required
            placeholder="VIP grants you access to the VIP room and other perks!"
            mb="md"
            classNames={BLACK}
            {...form.getInputProps("description")}
          />
          <NumberInput
            label="Price"
            description="The price of the gamepass in Tickets"
            required
            placeholder="100"
            mb="md"
            classNames={BLACK}
            icon={<HiTicket />}
            {...form.getInputProps("price")}
          />
          <Descriptive
            title="Icon"
            description="The icon of the gamepass"
            required
          >
            <div className="flex items-center justify-between mb-4">
              {form.values.icon ? (
                <Image
                  src={form.values.icon}
                  width={64}
                  height={64}
                  radius="md"
                  ref={imgRef}
                />
              ) : (
                <div className="w-16 h-16 rounded-md dark:bg-zinc-900 bg-gray-100 border dark:border-zinc-700 border-gray-200 border-solid" />
              )}
              <ImageUploader
                crop
                ratio={1}
                imgRef={imgRef}
                onFinished={(img) => {
                  form.setFieldValue("icon", img);
                }}
              />
            </div>
          </Descriptive>
          <Button type="submit" mt={16}>
            Create gamepass
          </Button>
        </form>
      </Modal>
      <EditGameTab value="store">
        <Text mb={32}>
          Your store is a digital storefront where users can purchase products
          like gamepasses that can be referenced in your games and can grant
          various perks to users.
        </Text>
        <Text color="dimmed" size="sm" mb={6}>
          1. Gambling is permitted under the condition that it is not possible
          to purchase the currency used for it. The currency must be earnable by
          playing the game or by other means that are not purchasable. You must
          implement a fair algorithm so that the end user is not rigged up to
          lose. If Framework&apos;s Tickets are involved in any step of the
          process, your account may be permanently banned by Framework staff.
        </Text>
        <Text color="dimmed" size="sm" mb={6}>
          2. You must indicate actual numerical odds for &quot;random&quot;
          events. For example, &quot;1 in 1000 chance of winning&quot; is
          acceptable, but &quot;1 in 1000 chance of winning, but you can buy
          more tickets to increase your odds&quot; is not.
        </Text>
        <Text color="dimmed" size="sm" mb={32}>
          3. You must not sell access to off-platform services. An example of
          this would be selling access to a role in a Discord server. This is
          not permitted and may result in your account being moderated.
        </Text>

        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 gap-y-8">
          <Conditional if={gamepasses && gamepasses.length > 0}>
            {gamepasses.map((gamepass, index) => (
              <AssetCard type="gamepass" asset={gamepass} key={index} />
            ))}
            <ShadedButton
              className="flex items-center text-center justify-center flex-col gap-2"
              onClick={() => setOpened(true)}
            >
              <HiPlus className="text-2xl" />
              <Text size="sm" color="dimmed">
                Create a new gamepass
              </Text>
            </ShadedButton>
          </Conditional>
          <Conditional if={gamepasses && gamepasses.length === 0}>
            <ShadedCard className="col-span-full flex flex-col justify-center items-center">
              <ModernEmptyState
                title="No gamepasses"
                body="You haven't created any gamepasses yet."
              />
              <Button mt="lg" onClick={() => setOpened(true)}>
                Create a new gamepass
              </Button>
            </ShadedCard>
          </Conditional>
          <Conditional if={!gamepasses}>
            {Array.from(Array(4)).map((_, index) => (
              <Skeleton height={180} key={index} />
            ))}
          </Conditional>
        </div>
      </EditGameTab>
    </>
  );
};

export default Store;
