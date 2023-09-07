import Owner from "@/components/owner";
import useReportAbuse, { ReportAbuseProps } from "@/stores/useReportAbuse";
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
import { FC } from "react";
import { HiOutlineTag, HiOutlineUpload } from "react-icons/hi";

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
          <Text>
            {props.contentType
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
          </Text>
          <Text color="dimmed" size="sm" className="flex items-center gap-2">
            <HiOutlineTag />
            <span>{props.contentId.split("-")[0]}</span>
          </Text>
        </div>
      </div>
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
        <Button variant="light" radius="xl" leftIcon={<HiOutlineUpload />}>
          Submit
        </Button>
      </div>
    </Modal>
  );
};

export default ReportAbusePrompt;
