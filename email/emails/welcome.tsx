import { Button } from "@react-email/button";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { styles } from "./framework";
import EmailLayout from "./layout";

interface WelcomeProps {
  username: string;
}

const Welcome: React.FC<WelcomeProps> = ({ username = "Example" }) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Framework</Preview>
      <EmailLayout
        title={
          <>
            Welcome to Framework, <b>{username}</b>
          </>
        }
      >
        <Text style={styles.text}>
          Hello <b>{username}</b>,
        </Text>
        <Text style={styles.text}>
          Thank you for signing up for Framework. We&apos;re excited to have you
          on board.
        </Text>
        <Text style={styles.text}>
          We hope you enjoy using Framework as much as we enjoy building it.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default Welcome;
