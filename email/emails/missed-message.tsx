import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Preview } from "@react-email/preview";
import { Text } from "@react-email/text";
import { styles } from "./framework";
import EmailLayout from "./layout";

interface MissedMessageProps {
  from: string;
  message: string;
}

const MissedMessage: React.FC<MissedMessageProps> = ({
  from = "Example",
  message = "Hello there! How are you?",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Missed message</Preview>
      <EmailLayout
        title={<>You have a new message</>}
        footer={
          <>
            You are receiving this email because you turned on email
            notifications for missed messages. You can turn off email
            notifications in your notification settings.
          </>
        }
      >
        <Text style={styles.text}>
          You have a new message from <b>{from}</b>.
        </Text>
        <Text
          style={{
            ...styles.text,
            padding: "24px",
            backgroundColor: "#f2f3f3",
            borderRadius: "4px",
          }}
        >
          {message}
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default MissedMessage;
