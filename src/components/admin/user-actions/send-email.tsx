import Action from "@/components/admin/user-actions/actions";
import Descriptive from "@/components/descriptive";
import RichText from "@/components/rich-text";
import Stateful from "@/components/stateful";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import performAdminAction, { AdminAction } from "@/util/admin-action";
import { User } from "@/util/prisma-types";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { openModal } from "@mantine/modals";
import StaffEmail from "email/emails/staff-email";
import React from "react";
import { HiEye, HiMail, HiPaperAirplane, HiX } from "react-icons/hi";

interface SendEmailProps {
  user: User;
}

interface FormValues {
  subject: string;
  content: string;
}

const SendEmail: React.FC<SendEmailProps> & {
  title: string;
  description: string;
} = ({ user }) => {
  const form = useForm<FormValues>({
    initialValues: {
      subject: "",
      content: "",
    },
    validate: {
      subject: (value) => {
        if (!value) {
          return "Subject is required";
        }
      },
      content: (value) => {
        if (!value) {
          return "Content is required";
        }
      },
    },
  });
  const { user: admin } = useAuthorizedUserStore();

  return (
    <Stateful>
      {(open, setOpen) => (
        <>
          <Action
            title="Send email"
            description="Send an email to this user"
            onClick={() => setOpen(true)}
            icon={HiMail}
          />
          <Modal
            title="Send email"
            onClose={() => setOpen(false)}
            opened={open}
          >
            <form
              onSubmit={form.onSubmit(async (values) => {
                await performAdminAction(
                  AdminAction.SEND_EMAIL,
                  values,
                  user.id
                ).then(() => {
                  setOpen(false);
                  form.reset();
                });
              })}
            >
              <Stack spacing={16}>
                <TextInput
                  label="Subject"
                  description="The subject of the email"
                  placeholder="Email subject..."
                  required
                  {...form.getInputProps("subject")}
                />
                <Descriptive
                  title="Content"
                  description="The content of the email. Supports rich text."
                  required
                >
                  <RichText
                    controls={[
                      ["bold", "italic", "underline"],
                      ["orderedList", "unorderedList"],
                    ]}
                    styles={() => ({
                      root: {
                        height: 240,
                        overflow: "auto",
                      },
                    })}
                    placeholder="Email content..."
                    {...form.getInputProps("content")}
                  />
                </Descriptive>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="default"
                    onClick={() => {
                      setOpen(false);
                      form.reset();
                    }}
                    leftIcon={<HiX />}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setOpen(false);
                      openModal({
                        title: "Email preview",
                        children: (
                          <StaffEmail
                            subject={form.values.subject}
                            content={form.values.content}
                            sender={admin?.employee?.fullName!}
                            contact={admin?.employee?.contactEmail!}
                          />
                        ),
                        onClose: () => setOpen(true),
                        size: "lg",
                      });
                    }}
                    leftIcon={<HiEye />}
                  >
                    Preview
                  </Button>
                  <Button type="submit" leftIcon={<HiPaperAirplane />}>
                    Send
                  </Button>
                </div>
              </Stack>
            </form>
          </Modal>
        </>
      )}
    </Stateful>
  );
};

SendEmail.title = "Send email";
SendEmail.description = "Adjust employee details";

export default SendEmail;
