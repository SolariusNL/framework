import {
  Badge,
  Button,
  Modal,
  NumberInput,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormValidateInput } from "@mantine/form/lib/types";
import { showNotification } from "@mantine/notifications";
import { GameFund } from "@prisma/client";
import { getCookie } from "cookies-next";
import { motion } from "framer-motion";
import React from "react";
import {
  HiAtSymbol,
  HiCheckCircle,
  HiPencil,
  HiPlus,
  HiTicket,
  HiTrash,
  HiXCircle,
} from "react-icons/hi";
import { BLACK } from "../../pages/teams/t/[slug]/issue/create";
import IResponseBase from "../../types/api/IResponseBase";
import fetchJson from "../../util/fetch";
import { Game } from "../../util/prisma-types";
import Descriptive from "../Descriptive";
import { Section } from "../Home/FriendsWidget";
import Markdown, { ToolbarItem } from "../Markdown";
import ModernEmptyState from "../ModernEmptyState";
import RenderMarkdown from "../RenderMarkdown";
import ShadedCard from "../ShadedCard";
import Stateful from "../Stateful";
import EditGameTab from "./EditGameTab";

type FundingProps = {
  game: Game;
};
type CreateFundForm = { name: string; goal: number; description: string };

const validations: Record<keyof CreateFundForm, (value: any) => string | void> =
  {
    name: (value: string) => {
      if (!value) return "Name is required";
      if (value.length > 50) return "Name cannot be longer than 50 characters";
    },
    goal: (value: number) => {
      if (!value) return "Goal is required";
      if (value < 50) return "Goal must be at least 50T$";
      if (value > 1000000) return "Goal cannot be more than 1,000,000T$";
    },
    description: (value: string) => {
      if (!value) return "Description is required";
      if (value.length > 1024)
        return "Description cannot be longer than 1024 characters";
    },
  };
const toolbar = [
  ToolbarItem.Bold,
  ToolbarItem.Italic,
  ToolbarItem.Url,
  ToolbarItem.Help,
  ToolbarItem.BulletList,
  ToolbarItem.OrderedList,
  ToolbarItem.Table,
  ToolbarItem.H3,
  ToolbarItem.H4,
];
const headers = {
  "Content-Type": "application/json",
  Authorization: String(getCookie(".frameworksession")),
};

const Funding = ({ game }: FundingProps) => {
  const [loading, setLoading] = React.useState(false);
  const [funds, setFunds] = React.useState<
    Array<
      Pick<
        GameFund,
        "id" | "name" | "target" | "current" | "description" | "descriptionMd"
      >
    >
  >(game.funds);
  const { colorScheme } = useMantineColorScheme();
  const form = useForm<CreateFundForm>({
    initialValues: {
      name: "",
      goal: 0,
      description: "",
    },
    validate: validations as FormValidateInput<CreateFundForm>,
  });
  const editForm = useForm<CreateFundForm>({
    initialValues: {
      name: "",
      goal: 0,
      description: "",
    },
    validate: validations as FormValidateInput<CreateFundForm>,
  });

  const createFund = async (values: CreateFundForm) => {
    setLoading(true);
    await fetch(`/api/games/${game.id}/fund/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          showNotification({
            title: "Error",
            message:
              res.error ||
              "An unknown error occurred and we couldn't create the fund. Please try again later.",
            icon: <HiXCircle />,
            color: "red",
          });
          return;
        }

        setFunds(
          funds.concat({
            id: res.fund.id,
            name: res.fund.name,
            target: res.fund.target,
            current: res.fund.current,
            description: res.fund.description,
            descriptionMd: res.fund.descriptionMd,
          })
        );
        form.reset();

        showNotification({
          title: "Success",
          message: "Fund created successfully.",
          icon: <HiCheckCircle />,
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };
  const editFund = async (values: CreateFundForm, id: string) => {
    await fetch(`/api/games/${game.id}/fund/${id}/edit`, {
      method: "POST",
      headers,
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          showNotification({
            title: "Error",
            message:
              res.error ||
              "An unknown error occurred and we couldn't edit the fund. Please try again later.",
            icon: <HiXCircle />,
            color: "red",
          });
          return;
        }

        setFunds(
          funds.map((fund) => {
            if (fund.id === id) {
              return {
                id: res.fund.id,
                name: res.fund.name,
                target: res.fund.target,
                current: res.fund.current,
                description: res.fund.description,
                descriptionMd: res.fund.descriptionMd,
              };
            }
            return fund;
          })
        );

        showNotification({
          title: "Success",
          message: "Fund edited successfully.",
          icon: <HiCheckCircle />,
        });
        editForm.reset();
      })
      .catch((err) => console.error(err));
  };
  const deleteFund = async (id: string) => {
    await fetchJson<IResponseBase>(`/api/games/${game.id}/fund/${id}`, {
      method: "DELETE",
      auth: true,
    }).then((res) => {
      if (!res.success) {
        showNotification({
          title: "Error",
          message:
            res.message ||
            "An unknown error occurred and we couldn't delete the fund. Please try again later.",
          icon: <HiXCircle />,
          color: "red",
        });
        return;
      }
    });
  };

  return (
    <>
      <EditGameTab value="funding">
        <Text mb="sm">
          Funds are a way to raise money for your game. You can create multiple
          funds to raise money for different things, such as development costs,
          advertisements, or to pay your team.
        </Text>
        <Text color="dimmed" size="sm" mb="lg">
          Funds are currently in beta. If you have any issues, please contact
          us.
        </Text>
        <ShadedCard>
          <form onSubmit={form.onSubmit(createFund)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextInput
                label="Name"
                placeholder="Development costs"
                required
                icon={<HiAtSymbol />}
                classNames={{ input: "!mt-1 dark:bg-black" }}
                {...form.getInputProps("name")}
              />
              <NumberInput
                label="Goal"
                placeholder="5000T$"
                required
                icon={<HiTicket />}
                classNames={{ input: "!mt-1 dark:bg-black" }}
                {...form.getInputProps("goal")}
              />
            </div>
            <Descriptive
              title="Description"
              description="Detail your fund, what it'll go towards, etc. Markdown is supported."
            >
              <Markdown
                toolbar={toolbar}
                {...form.getInputProps("description")}
              />
            </Descriptive>
            <div className="flex justify-end mt-4">
              <Button leftIcon={<HiPlus />} type="submit" loading={loading}>
                Create Fund
              </Button>
            </div>
          </form>
        </ShadedCard>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {funds.length > 0 ? (
            funds.map((fund) => (
              <Stateful key={fund.id}>
                {(opened, setOpened) => (
                  <>
                    <Modal
                      title="Edit fund"
                      size="lg"
                      opened={opened}
                      onClose={() => setOpened(false)}
                      className={colorScheme === "dark" ? "dark" : ""}
                    >
                      <form
                        onSubmit={editForm.onSubmit(
                          async (values) =>
                            await editFund(values, fund.id).then(() =>
                              setOpened(false)
                            )
                        )}
                      >
                        <Section
                          title="Details"
                          description="Edit the details of your fund."
                          sm
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <TextInput
                            label="Name"
                            placeholder="Development costs"
                            required
                            icon={<HiAtSymbol />}
                            classNames={BLACK}
                            {...editForm.getInputProps("name")}
                          />
                          <NumberInput
                            label="Goal"
                            placeholder="5000T$"
                            required
                            icon={<HiTicket />}
                            classNames={BLACK}
                            {...editForm.getInputProps("goal")}
                          />
                        </div>
                        <Section
                          title="Description"
                          description="Detail your fund, what it'll go towards, etc. Markdown is supported."
                          sm
                        />
                        <Markdown
                          toolbar={toolbar}
                          {...editForm.getInputProps("description")}
                        />
                        <div className="flex justify-end mt-4 gap-2">
                          <Stateful initialState={0}>
                            {(confirmed, setConfirmed) => (
                              <Button
                                leftIcon={<HiTrash />}
                                color="red"
                                onClick={() => {
                                  const repeated = confirmed + 1;
                                  setConfirmed(repeated);
                                  if (repeated === 2) {
                                    deleteFund(fund.id).then(() => {
                                      setFunds(
                                        funds.filter(
                                          (fund) => fund.id !== fund.id
                                        )
                                      );
                                      setOpened(false);
                                    });
                                  }
                                }}
                              >
                                {confirmed === 1 ? "Confirm" : "Delete"}
                              </Button>
                            )}
                          </Stateful>
                          <Button leftIcon={<HiPencil />} type="submit">
                            Confirm
                          </Button>
                        </div>
                      </form>
                    </Modal>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <ShadedCard
                        onClick={() => {
                          setOpened(true);
                          editForm.setValues({
                            name: fund.name,
                            goal: fund.target,
                            description: fund.descriptionMd,
                          });
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <Text size="lg" weight={500}>
                            {fund.name}
                          </Text>
                          <Badge
                            size="sm"
                            radius="md"
                            color={
                              fund.current === fund.target ? "green" : "blue"
                            }
                          >
                            {fund.current === fund.target
                              ? "Complete"
                              : "Active"}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <RenderMarkdown clamp={3} proseAddons="prose-sm">
                            {fund.description}
                          </RenderMarkdown>
                        </div>
                        <div className="mt-4 flex justify-around items-center">
                          {[
                            {
                              label: "Raised",
                              value: `${fund.current}T$`,
                            },
                            {
                              label: "Goal",
                              value: `${fund.target}T$`,
                            },
                          ].map((stat) => (
                            <div
                              key={stat.label}
                              className="flex flex-col items-center"
                            >
                              <Text color="dimmed" size="sm">
                                {stat.label}
                              </Text>
                              <Text weight={500}>{stat.value}</Text>
                            </div>
                          ))}
                        </div>
                      </ShadedCard>
                    </motion.div>
                  </>
                )}
              </Stateful>
            ))
          ) : (
            <ShadedCard className="col-span-full">
              <ModernEmptyState
                title="No funds"
                body="Create a fund to get started."
              />
            </ShadedCard>
          )}
        </div>
      </EditGameTab>
    </>
  );
};

export default Funding;
