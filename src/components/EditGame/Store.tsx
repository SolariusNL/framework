import {
  ActionIcon,
  Button,
  Modal,
  NumberInput,
  Table,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Gamepass } from "@prisma/client";
import { getCookie } from "cookies-next";
import React from "react";
import { HiCheckCircle, HiPlus, HiTrash } from "react-icons/hi";
import abbreviateNumber from "../../util/abbreviate";
import { Game } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import Stateful from "../Stateful";
import EditGameTab from "./EditGameTab";

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
}

const Store: React.FC<StoreProps> = ({ game }) => {
  const form = useForm<GamepassForm>({
    initialValues: {
      name: "",
      description: "",
      price: 0,
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
    },
  });
  const [gamepasses, setGamepasses] = React.useState(game.gamepasses);

  return (
    <>
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

        <Table striped mb={16}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Owners</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gamepasses.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <ModernEmptyState
                    title="No gamepasses"
                    body="Create a gamepass to get started"
                  />
                </td>
              </tr>
            ) : (
              gamepasses.map((gamepass) => (
                <tr key={gamepass.id}>
                  <td>{gamepass.name}</td>
                  <td>
                    <Text lineClamp={2}>{gamepass.description}</Text>
                  </td>
                  <td>{gamepass.price}</td>
                  <td>{gamepass.owners.length}</td>
                  <td>
                    {abbreviateNumber(gamepass.owners.length * gamepass.price)}
                  </td>
                  <td>
                    <Tooltip label="Delete this gamepass">
                      <ActionIcon
                        color="red"
                        onClick={async () => {
                          await fetch(
                            `/api/games/${game.id}/gamepass/${gamepass.id}/delete`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: String(
                                  getCookie(".frameworksession")
                                ),
                              },
                            }
                          );

                          setGamepasses(
                            gamepasses.filter((gp) => gp.id !== gamepass.id)
                          );
                          showNotification({
                            title: "Deleted gamepass",
                            message: "The gamepass was deleted successfully",
                            icon: <HiTrash />,
                          });
                        }}
                      >
                        <HiTrash />
                      </ActionIcon>
                    </Tooltip>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <Stateful>
          {(opened, setOpened) => (
            <>
              <Button
                variant="subtle"
                leftIcon={<HiPlus />}
                onClick={() => setOpened(true)}
              >
                Create a new gamepass
              </Button>
              <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Create a new gamepass"
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
                      .then((res) => res.json())
                      .then((res) => {
                        if (res.success) {
                          showNotification({
                            title: "Created gamepass",
                            message:
                              "Your gamepass has been created successfully",
                            icon: <HiCheckCircle />,
                          });
                          setOpened(false);
                          setGamepasses((prev: any) => [
                            ...prev,
                            res.gamepass as Gamepass,
                          ]);
                        }
                      });
                  })}
                >
                  <TextInput
                    label="Name"
                    description="The name of the gamepass"
                    required
                    mb={8}
                    {...form.getInputProps("name")}
                  />
                  <Textarea
                    label="Description"
                    description="The description of the gamepass, what it grants the user, etc."
                    required
                    mb={8}
                    {...form.getInputProps("description")}
                  />
                  <NumberInput
                    label="Price"
                    description="The price of the gamepass in Tickets"
                    required
                    {...form.getInputProps("price")}
                  />
                  <Button type="submit" mt={16}>
                    Create gamepass
                  </Button>
                </form>
              </Modal>
            </>
          )}
        </Stateful>
      </EditGameTab>
    </>
  );
};

export default Store;
