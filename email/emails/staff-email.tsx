import { Head } from "@react-email/head";
import { Hr } from "@react-email/hr";
import { Html } from "@react-email/html";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Text } from "@react-email/text";
import React from "react";
import { styles } from "./framework";
import EmailLayout from "./layout";

interface StaffEmailProps {
  subject: string;
  content: string;
  sender: string;
  contact: string;
}

const StaffEmail: React.FC<StaffEmailProps> = ({
  subject = "Need help?",
  content = "Hey, we received your message and since it's been a while, we thought we'd check in to see if you still need help.",
  sender = "Emil Osmicevic",
  contact = "emil@solarius.me",
}) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout
        title={<>{subject}</>}
        footer={
          <>
            This email was sent by a Solarius staff member. If you have any
            questions, please contact us at our{" "}
            <Link href="https://framework.solarius.me/support">
              support center
            </Link>{" "}
            for assistance.
          </>
        }
      >
        <Text
          style={styles.text}
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <Hr style={styles.spacing} />
        <Text style={styles.text}>
          From: <b>{sender}</b> -{" "}
          <Link href={`mailto:${contact}`}>{contact}</Link>
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default StaffEmail;
