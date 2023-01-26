import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Preview } from "@react-email/preview";
import { Text } from "@react-email/text";
import { styles } from "./framework";
import EmailLayout from "./layout";

interface SupportTicketClosedProps {
  title: string;
}

const SupportTicketClosed: React.FC<SupportTicketClosedProps> = ({
  title = "My Ticket",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Support Ticket Closed</Preview>
      <EmailLayout
        title={<>Support ticket closed</>}
        footer={
          <>
            This is an automated email to remind you that your support ticket
            has been closed. If this wasn&apos;t you, you can safely ignore this
            email.
          </>
        }
      >
        <Text style={styles.text}>
          Your support ticket, <b>{title}</b>, has been closed. If you have any
          further questions, please open a new support ticket.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default SupportTicketClosed;
