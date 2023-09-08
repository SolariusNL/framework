import Owner from "@/components/owner";
import { createAbuseReportSchema } from "@/pages/api/abuse/[[...params]]";
import useReportAbuse, { ReportAbuseProps } from "@/stores/useReportAbuse";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import { reportCategories } from "@/util/types";
import {
  Button,
  Modal,
  Select,
  Text,
  Textarea,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { FC } from "react";
import {
  HiCheckCircle,
  HiOutlineTag,
  HiOutlineUpload,
  HiXCircle,
} from "react-icons/hi";
import { z } from "zod";

type ReportAbusePromptProps = ReportAbuseProps;
type ReportAbuseForm = {
  category: string;
  description: string;
};

const ReportAbusePrompt: FC<ReportAbusePromptProps> = (props) => {
  const { opened, setOpened } = useReportAbuse();
  const { colorScheme } = useMantineColorScheme();
  const form = useForm<ReportAbuseForm>({
    initialValues: {
      category: "",
      description: "",
    },
  });

  const submitForm = async (values: ReportAbuseForm) => {
    await fetchJson<IResponseBase>("/api/abuse/new", {
      method: "POST",
      body: {
        category: values.category,
        contentId: props.contentId,
        contentType: props.contentType,
        description: values.description,
      } as z.infer<typeof createAbuseReportSchema>,
      auth: true,
    }).then((res) => {
      if (res.success) {
        setOpened(false);
        showNotification({
          title: "Report submitted",
          message: "Your report has been submitted successfully. Thank you!",
          icon: <HiCheckCircle />,
        });
      } else {
        showNotification({
          color: "red",
          title: "Error",
          message: res.message,
          icon: <HiXCircle />,
        });
      }
    });
  };

  return (
    <Modal
      title="Report abuse"
      opened={opened}
      onClose={() => setOpened(false)}
      className={colorScheme}
    >
      <Text size="sm" color="dimmed" className="mb-6">
        Please review and fill out the report abuse form below. We will review
        your report and take action as soon as possible. Thank you for helping
        keep Framework safe!
      </Text>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <Text size="sm" mb="sm" color="dimmed" weight={500}>
            Associated user
          </Text>
          <Owner user={props.author} />
        </div>
        <div className="flex-1">
          <Text size="sm" mb="sm" color="dimmed" weight={500}>
            Content type
          </Text>
          <Text>{Fw.Strings.pascalToNormal(props.contentType)}</Text>
          <Text color="dimmed" size="sm" className="flex items-center gap-2">
            <HiOutlineTag />
            <span>{props.contentId.split("-")[0]}</span>
          </Text>
        </div>
      </div>
      <form onSubmit={form.onSubmit(submitForm)}>
        <div className="flex flex-col mt-6 gap-4">
          <Select
            label="Category"
            description="What type of abuse are you reporting?"
            placeholder="Select a category"
            required
            data={reportCategories.map((cat) => ({
              value: cat,
              label: cat,
            }))}
            {...form.getInputProps("category")}
          />
          <Textarea
            label="Description"
            description="Please describe the abuse you are reporting."
            placeholder="Describe the abuse you are reporting"
            required
            {...form.getInputProps("description")}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="light"
            radius="xl"
            color="gray"
            onClick={() => setOpened(false)}
          >
            Cancel
          </Button>
          <Button
            variant="light"
            radius="xl"
            leftIcon={<HiOutlineUpload />}
            type="submit"
          >
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportAbusePrompt;
