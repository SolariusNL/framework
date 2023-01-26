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

interface EmailProps {
  username: string;
  apiLink: string;
}

const Email: React.FC<EmailProps> = ({
  username = "Example",
  apiLink = "https://example.com",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email</Preview>
      <EmailLayout
        title={
          <>
            Verify your <b>Framework</b> email address
          </>
        }
      >
        <Text style={styles.text}>
          Hello <b>{username}</b>,
        </Text>
        <Text style={styles.text}>
          You recently created a Framework account using this email address, or
          added it to your existing account. To complete the process, please
          verify your email address by clicking the button below.
        </Text>
        <Text style={styles.text}>
          If you do not have a Framework account, you can safely delete this
          email. If you did not request this verification, please verify your
          account security.
        </Text>
        <Section
          style={{
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            display: "flex",
          }}
        >
          <Button pX={20} pY={12} style={styles.btn} href={apiLink}>
            Verify email
          </Button>
        </Section>
        <Text style={styles.dimmed}>
          <br />
          or copy and paste this URL into your browser:{" "}
          <Link
            href={apiLink}
            target="_blank"
            style={styles.link}
            rel="noreferrer"
          >
            {apiLink}
          </Link>
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default Email;
