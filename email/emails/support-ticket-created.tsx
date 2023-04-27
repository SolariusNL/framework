import { Head } from "@react-email/head";
import { Hr } from "@react-email/hr";
import { Html } from "@react-email/html";
import { Preview } from "@react-email/preview";
import { Text } from "@react-email/text";
import { styles } from "./framework";
import EmailLayout from "./layout";

interface SupportTicketCreatedProps {
  title: string;
  category: string;
  contactEmail: string;
  contactName: string;
}

const SupportTicketCreated: React.FC<SupportTicketCreatedProps> = ({
  title = "My Ticket",
  category = "Account",
  contactEmail = "example@test.com",
  contactName = "John Doe",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Support Ticket Created</Preview>
      <EmailLayout
        title={<>Support ticket created</>}
        footer={
          <>
            This is an automated email to remind you have created a support
            ticket. If this wasn&apos;t you, you can safely ignore this email.
          </>
        }
      >
        <Text style={styles.text}>
          Your support ticket, <b>{title}</b> has been created and received by
          our support team. We will get back to you as soon as possible.
        </Text>
        <Hr />
        <Text style={styles.text}>
          <b>Category:</b> {category}
        </Text>
        <Text style={styles.text}>
          <b>Contact Email:</b> {contactEmail}
        </Text>
        <Text style={styles.text}>
          <b>Contact Name:</b> {contactName}
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default SupportTicketCreated;
