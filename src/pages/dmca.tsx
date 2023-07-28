import Framework from "@/components/framework";
import { Section } from "@/components/home/friends";
import ShadedCard from "@/components/shaded-card";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  MultiSelect,
  Select,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { GetServerSideProps } from "next";
import Link from "next/link";
import {
  HiAtSymbol,
  HiCheck,
  HiCheckCircle,
  HiLink,
  HiXCircle,
} from "react-icons/hi";
import { BLACK } from "./teams/t/[slug]/issue/create";

type DMCAProps = { user: User };
type AuthorizedType =
  | "copyright-holder"
  | "authorized-agent"
  | "not-authorized";
type Solution = "private" | "remove" | "other";
type DMCAForm = {
  from: string;
  authorized: AuthorizedType;
  isOnFramework: boolean;
  descriptionOfCopyrightOwnership: string;
  descriptionOfInfringement: string;
  urls: string[];
  desiredRemoved: string[];
  hasAntiCircumvention: boolean;
  isViolatingOpenSource: boolean;
  solution: Solution;
  infringerContactInformation: string;
  goodFaith: boolean;
  swearOfPerjury: boolean;
  fairUse: boolean;
  contactInformation: string;
  fullLegalName: string;
};

const DMCA: React.FC<DMCAProps> = ({ user }) => {
  const form = useForm<DMCAForm>({
    initialValues: {
      from: "",
      authorized: "authorized-agent",
      isOnFramework: false,
      descriptionOfCopyrightOwnership: "",
      descriptionOfInfringement: "",
      urls: [],
      desiredRemoved: [],
      hasAntiCircumvention: false,
      isViolatingOpenSource: false,
      solution: "private",
      infringerContactInformation: "",
      goodFaith: false,
      swearOfPerjury: false,
      fairUse: false,
      contactInformation: "",
      fullLegalName: "",
    },
    validate: {
      from: (value) => {
        if (!value) return "This field is required";
        if (!value.includes("@")) return "This field must be a valid email";
      },
      authorized: (value: AuthorizedType) => {
        if (!value) return "This field is required";
      },
      isOnFramework: (value: boolean) => {
        if (!value) return "This field is required";
      },
      descriptionOfCopyrightOwnership: (value) => {
        if (!value) return "This field is required";
      },
      descriptionOfInfringement: (value) => {
        if (!value) return "This field is required";
      },
      urls: (value) => {
        if (!value) return "This field is required";
      },
      desiredRemoved: (value) => {
        if (!value) return "This field is required";
      },
      hasAntiCircumvention: (value: boolean) => {
        if (!value) return "This field is required";
      },
      isViolatingOpenSource: (value: boolean) => {
        if (!value) return "This field is required";
      },
      solution: (value: Solution) => {
        if (!value) return "This field is required";
      },
      infringerContactInformation: (value) => {
        if (!value) return "This field is required";
      },
      goodFaith: (value: boolean) => {
        if (!value) return "This field is required";
      },
      swearOfPerjury: (value: boolean) => {
        if (!value) return "This field is required";
      },
      fairUse: (value: boolean) => {
        if (!value) return "This field is required";
      },
      contactInformation: (value) => {
        if (!value) return "This field is required";
      },
      fullLegalName: (value) => {
        if (!value) return "This field is required";
      },
    },
  });

  return (
    <Framework
      activeTab="none"
      modernTitle="DMCA Takedown Request"
      user={user}
      modernSubtitle="Fill out the form below to submit a DMCA takedown request."
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Text color="dimmed" mb={6}>
            DMCA Takedown Request
          </Text>
          <Title order={2} mb={24}>
            Before you continue
          </Title>
          <Text size="sm" color="dimmed" mb="md">
            If you believe that your work has been copied in a way that
            constitutes copyright infringement or that your intellectual
            property rights have been otherwise violated under the European
            Union&apos;s General Data Protection Regulation (GDPR), or any other
            applicable law, please fill out this form to request that the
            content be changed or removed.
          </Text>
          <Text size="sm" color="dimmed" mb="md">
            Please note that you may be held liable for damages (including costs
            and attorneys&apos; fees) if you make material misrepresentations in
            a DMCA notification. Thus, if you are not sure whether material
            available online infringes your copyright, we suggest that you first
            contact an attorney.
          </Text>
          <Text size="sm" color="dimmed" mb="md">
            In order to prevent unnecessary processing delays, please ensure
            that:
          </Text>
          <ul className="list-disc">
            <li>
              <Text size="sm" color="dimmed">
                Do not send duplicate notifications. Please allow at least 10
                business days for the notification to be processed before
                sending another.
              </Text>
            </li>
            <li>
              <Text size="sm" color="dimmed">
                Do not send notifications for content that is not hosted on
                Framework. Please contact the website or service directly.
              </Text>
            </li>
            <li>
              <Text size="sm" color="dimmed">
                Include all links to violating content to speed up the removal
                process.
              </Text>
            </li>
            <li>
              <Text size="sm" color="dimmed">
                If the content you are reporting is private or personally
                identifying, it is not protected by copyright. Instead, directly
                contact us through our{" "}
                <Link href="/support" passHref>
                  <Anchor>support page</Anchor>
                </Link>
                .
              </Text>
            </li>
          </ul>
          <Text size="sm" color="dimmed" mb="md" mt="lg">
            Your submission is being made under penalty of perjury that the
            information provided is accurate and that you are the owner of the
            exclusive right that is allegedly infringed, or are authorized to
            act on behalf of the owner of an exclusive right that is allegedly
            infringed.
          </Text>
          <Text size="sm" color="dimmed" mb="md">
            Committing perjury is a{" "}
            <span className="font-semibold">serious offense</span> and can
            result in{" "}
            <span className="font-semibold">
              legal action either from Solarius in defense of the content or
              from the content owner
            </span>
            .
          </Text>
        </div>
        <div className="flex-1">
          <ShadedCard>
            <form
              onSubmit={form.onSubmit(async (values) => {
                await fetch("/api/support/dmca", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(values),
                })
                  .then((res) => res.json())
                  .then((res) => {
                    if (res.status === 200) {
                      form.reset();
                      showNotification({
                        title: "Success",
                        message:
                          "Your DMCA request has been submitted. You've received an email confirming your submission.",
                        icon: <HiCheckCircle />,
                      });
                    } else {
                      showNotification({
                        title: "Error",
                        message:
                          "An error occurred while submitting your DMCA request. Please try again later.",
                        icon: <HiXCircle />,
                        color: "red",
                      });
                    }
                  });
              })}
            >
              <Section
                title="Authorized agent"
                description="We are unable to process DMCA requests in the absence of an individual authorized to act on behalf of the owner of an exclusive right that is allegedly infringed."
                sm
              />
              <TextInput
                classNames={BLACK}
                icon={<HiAtSymbol />}
                type="email"
                label="From"
                placeholder="Enter a contact email"
                required
                description="The email address of the authorized agent submitting this request."
                mb="sm"
                {...form.getInputProps("from")}
              />
              <Select
                data={[
                  {
                    label:
                      "Authorized agent - I am authorized on behalf of the owner of the infringed work.",
                    value: "authorized-agent",
                  },
                  {
                    label:
                      "Copyright owner - I am the owner of the infringed work.",
                    value: "copyright-owner",
                  },
                  {
                    label:
                      "I am not authorized to act on behalf of the owner of the infringed work.",
                    value: "not-authorized",
                  },
                ]}
                label="I am"
                required
                description="The role of the authorized agent submitting this request."
                mb="sm"
                classNames={BLACK}
                {...form.getInputProps("authorized")}
              />
              {form.values.authorized !== "not-authorized" ? (
                <>
                  <Textarea
                    label="Copyright ownership"
                    required
                    description="Please prove your ownership or authorization to act on behalf of the owner of the infringed work."
                    mb="xl"
                    placeholder="Prove ownership or authorization to act in this capacity."
                    classNames={BLACK}
                    minRows={6}
                    {...form.getInputProps("descriptionOfCopyrightOwnership")}
                  />
                  <Section
                    title="Infringing content"
                    description="Please provide the following information about the content that you believe infringes your rights."
                    sm
                  />
                  <Checkbox
                    label="The content is hosted on Framework and is not private or personally identifying."
                    mb="sm"
                    required
                    {...form.getInputProps("isOnFramework")}
                  />
                  <Select
                    label="Solution"
                    description="The solution that you would like us to take in response to this request."
                    mb="sm"
                    classNames={BLACK}
                    required
                    data={[
                      {
                        label: "Remove the content",
                        value: "remove",
                      },
                      {
                        label: "Make the content private",
                        value: "private",
                      },
                    ]}
                    {...form.getInputProps("solution")}
                  />
                  {form.values.isOnFramework ? (
                    <>
                      <MultiSelect
                        data={
                          form.values.urls.map((url) => ({
                            label: url,
                            value: url,
                          })) || []
                        }
                        label="URLs"
                        required
                        description="The URLs of the content that you believe infringes your rights."
                        mb="sm"
                        classNames={BLACK}
                        placeholder="Add a URL"
                        icon={<HiLink />}
                        searchable
                        creatable
                        getCreateLabel={(query) => `+ Add ${query}`}
                        shouldCreate={(query) =>
                          query.length > 0 && /^https?:\/\//.test(query)
                        }
                        onCreate={(value) => {
                          form.insertListItem("urls", value);
                          return value;
                        }}
                        value={form.values.urls}
                      />
                      <MultiSelect
                        data={form.values.urls}
                        label="Desired URLs to moderate"
                        required
                        description="The URLs of the content that you would like to be moderated by the solution you selected."
                        mb="lg"
                        classNames={BLACK}
                        placeholder="Add a URL"
                        icon={<HiLink />}
                        searchable
                        value={form.values.desiredRemoved}
                        onChange={(value) => {
                          form.setFieldValue("desiredRemoved", value);
                        }}
                      />
                      <Checkbox
                        label="The content is violating open source licenses."
                        mb="lg"
                        {...form.getInputProps("isViolatingOpenSource")}
                      />
                      <Checkbox
                        label="The violating content before infringed was protected by anti-circumvention measures."
                        mb="lg"
                        {...form.getInputProps("hasAntiCircumvention")}
                      />
                      {form.values.isViolatingOpenSource ? (
                        <Alert color="blue" mb="lg">
                          If the content you are reporting is violating open
                          source licenses, please include how the content is
                          being used in violation of the license in the field
                          below. Include the name of the license and the
                          infracted guidelines
                        </Alert>
                      ) : null}
                      <Textarea
                        label="Infringement details"
                        required
                        description="Please provide details about the infringement, including the nature of the infringement and the location of the infringing material."
                        mb="sm"
                        placeholder="Provide details about the infringement."
                        classNames={BLACK}
                        minRows={6}
                        {...form.getInputProps("descriptionOfInfringement")}
                      />
                      <Textarea
                        label="Infringer contact information"
                        required
                        description="Please provide contact information for the infringer, including the infringer's name (if known), Framework username, address (if known), and email address (if known)."
                        mb="xl"
                        placeholder="Provide contact information for the infringer."
                        classNames={BLACK}
                        minRows={3}
                        {...form.getInputProps("infringerContactInformation")}
                      />
                      <Section
                        title="Final steps"
                        description="Confirm your oath of good faith and fill out your contact information."
                        sm
                      />
                      <Textarea
                        label="Contact information"
                        required
                        description="Please provide your contact information, including your name, address, and email address where applicable."
                        mb="lg"
                        placeholder="Provide your contact information."
                        classNames={BLACK}
                        minRows={3}
                        {...form.getInputProps("contactInformation")}
                      />
                      <Checkbox
                        label="I have a good faith belief that use of the copyrighted materials described above on the infringing web pages is not authorized by the copyright owner, or its agent, or the law."
                        mb="lg"
                        required
                        {...form.getInputProps("goodFaith")}
                      />
                      <Checkbox
                        label="I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner, or am authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed."
                        mb="lg"
                        required
                        {...form.getInputProps("swearOfPerjury")}
                      />
                      <Checkbox
                        label="I have taken fair use into consideration."
                        mb="lg"
                        required
                        {...form.getInputProps("fairUse")}
                      />
                      <TextInput
                        label="Full legal name"
                        required
                        description="Please provide your full legal name to sign this request."
                        mb="lg"
                        placeholder="Provide your full legal name."
                        classNames={BLACK}
                        {...form.getInputProps("fullLegalName")}
                      />
                      <Button
                        size="lg"
                        leftIcon={<HiCheck />}
                        type="submit"
                        fullWidth
                      >
                        Submit request
                      </Button>
                    </>
                  ) : (
                    <Alert color="red">
                      We are unable to process DMCA requests for content that is
                      not hosted on Framework. Please contact the website or
                      service directly.
                    </Alert>
                  )}
                </>
              ) : (
                <Alert color="red">
                  We are unable to process DMCA requests in the absence of an
                  individual authorized to act on behalf of the owner of an
                  exclusive right that is allegedly infringed.
                </Alert>
              )}
            </form>
          </ShadedCard>
        </div>
      </div>
    </Framework>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return authorizedRoute(ctx, false, false);
};

export default DMCA;
