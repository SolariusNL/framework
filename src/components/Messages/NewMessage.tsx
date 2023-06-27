import Descriptive from "@/components/Descriptive";
import UserSelect from "@/components/UserSelect";
import {
  Button,
  Modal,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import React from "react";
import { HiCheckCircle } from "react-icons/hi";

interface NewMessageProps {
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

interface NewMessageForm {
  recipientId: number;
  title: string;
  body: string;
  important: boolean;
}

const NewMessage: React.FC<NewMessageProps> = ({ opened, setOpened }) => {
  const form = useForm<NewMessageForm>({
    initialValues: {
      recipientId: 0,
      title: "",
      body: "",
      important: false,
    },
    validate: {
      recipientId: (value) => {
        if (value === 0) return "You must select a recipient";
      },
      title: (value) => {
        if (value.length < 3) return "Title must be atleast 3 characters";
        if (value.length > 32) return "Title must be less than 32 characters";
      },
      body: (value) => {
        if (value.length < 3) return "Body must be atleast 3 characters";
        if (value.length > 256) return "Body must be less than 1024 characters";
      },
    },
  });
  const [loading, setLoading] = React.useState(false);

  return (
    <Modal
      title="Compose message"
      opened={opened}
      onClose={() => setOpened(false)}
    >
      <Text mb={12}>Compose a new message to send to a friend.</Text>

      <form
        onSubmit={form.onSubmit(async (values) => {
          const { recipientId, title, body, important } = values;
          setLoading(true);

          await fetch(`/api/messages/new/${recipientId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: String(getCookie(".frameworksession")),
            },
            body: JSON.stringify({
              title,
              body,
              important,
            }),
          });

          setLoading(false);
          showNotification({
            title: "Message sent",
            message: "Your message has been sent successfully",
            icon: <HiCheckCircle />,
          });
          setOpened(false);
        })}
      >
        <Stack spacing={8} mb={12}>
          <UserSelect
            label="Recipient"
            description="Who will receive this message?"
            placeholder="Select a recipient"
            {...form.getInputProps("recipientId")}
          />
          <Descriptive
            title="Important"
            description="Mark this message as important"
          >
            <Switch {...form.getInputProps("important")} />
          </Descriptive>
          <TextInput
            label="Title"
            placeholder="Enter a title"
            required
            {...form.getInputProps("title")}
            description="What is this message about?"
          />
          <Textarea
            label="Body"
            placeholder="Enter a body"
            required
            {...form.getInputProps("body")}
            description="What do you want to say?"
          />
        </Stack>

        <Button type="submit" loading={loading}>
          Send message
        </Button>
      </form>
    </Modal>
  );
};

export default NewMessage;
