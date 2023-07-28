import InventTab from "@/components/invent/invent";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedButton from "@/components/shaded-button";
import ShadedCard from "@/components/shaded-card";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import { getCookie } from "@/util/cookies";
import { User } from "@/util/prisma-types";
import {
  Badge,
  Button,
  Group,
  Modal,
  Text,
  Textarea,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import {
  HiArrowRight,
  HiCheckCircle,
  HiPlus,
  HiTag,
  HiViewGrid,
} from "react-icons/hi";

type SnippetsProps = {
  user: User;
};
type SnippetForm = {
  name: string;
  description: string;
  language: "typescript" | "javascript" | "csharp";
};

const Snippets = ({ user }: SnippetsProps) => {
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const form = useForm<SnippetForm>({
    initialValues: {
      name: "",
      description: "",
      language: "typescript",
    },
    validate: {
      name: (value) => {
        if (!value) return "Name cannot be empty";
        if (value.length > 30)
          return "Name cannot be longer than 30 characters";
      },
      description: (value) => {
        if (!value) return "Description cannot be empty";
        if (value.length > 512)
          return "Description cannot be longer than 512 characters";
      },
    },
  });

  const router = useRouter();

  const createSnippet = async (values: SnippetForm) => {
    await fetch("/api/snippets/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          router.push(`/snippets/${res.id}/edit`);
          showNotification({
            title: "Success",
            message: "Snippet successfully created.",
            icon: <HiCheckCircle />,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
        setCreateModalOpen(false);
      });
  };

  return (
    <>
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create snippet"
        className={useMantineColorScheme().colorScheme}
      >
        <form onSubmit={form.onSubmit(createSnippet)}>
          <TextInput
            label="Name"
            description="Name of the snippet."
            maxLength={50}
            mb="md"
            classNames={BLACK}
            required
            icon={<HiTag />}
            placeholder="Ban admin command"
            {...form.getInputProps("name")}
          />

          <Textarea
            label="Description"
            description="Describe exactly what the snippet does. We recommend documenting every line, which will help others understand what the snippet does."
            maxLength={500}
            classNames={BLACK}
            required
            placeholder="Snippet adds a ban admin command to your Framework game using the Cosmic CLI API."
            {...form.getInputProps("description")}
          />

          <div className="flex justify-end">
            <Button
              loading={loading}
              leftIcon={<HiPlus />}
              mt="xl"
              type="submit"
            >
              Continue to code
            </Button>
          </div>
        </form>
      </Modal>

      <InventTab
        tabValue="snippets"
        tabTitle="Code Snippets"
        actions={
          <>
            <Group>
              <Link href="/snippets" passHref>
                <Button leftIcon={<HiViewGrid />} variant="default">
                  Browse snippets
                </Button>
              </Link>
              <Button
                leftIcon={<HiPlus />}
                variant="default"
                onClick={() => setCreateModalOpen(true)}
              >
                Create snippet
              </Button>
            </Group>
          </>
        }
        tabSubtitle="Share small code snippets with the community and help others learn programming concepts."
      >
        <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
          {user.snippets.map((s, i) => (
            <Link href={`/snippets/${s.id}/edit`} key={i}>
              <ShadedButton className="w-full flex flex-col gap-4">
                <div className="flex w-full justify-between items-center">
                  <Badge radius="md" color="grape" className="cursor-pointer">
                    {s.language || "TypeScript"}
                  </Badge>
                  <div className="text-dimmed">
                    <HiArrowRight />
                  </div>
                </div>
                <Text size="lg" className="flex items-center gap-2">
                  {s.name}
                </Text>
                <Text color="dimmed" size="sm" lineClamp={2}>
                  {s.description}
                </Text>
                <Text size="sm" color="dimmed">
                  {s.id.split("-").shift()}
                </Text>
              </ShadedButton>
            </Link>
          ))}
          {user.snippets.length === 0 && (
            <ShadedCard className="col-span-full">
              <ModernEmptyState
                title="No snippets"
                body="You don't have any snippets yet."
              />
            </ShadedCard>
          )}
        </div>
      </InventTab>
    </>
  );
};

export default Snippets;
