import { Button } from "@react-email/button";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { styles } from "./framework";
import EmailLayout from "./layout";

interface ResetPasswordProps {
  username: string;
  url: string;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({
  username = "Example",
  url = "https://example.com",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <EmailLayout
        title={
          <>
            Reset your <b>Framework</b> password
          </>
        }
      >
        <Text style={styles.text}>
          Hello <b>{username}</b>,
        </Text>
        <Text style={styles.text}>
          Someone (hopefully you) just requested a password reset for your
          Framework account.
        </Text>
        <Text style={styles.text}>
          If this wasn&apos;t you, you can safely ignore this email. Otherwise,
          you can reset your password by clicking the button below.
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
          <Button pX={20} pY={12} style={styles.btn} href={url}>
            Reset password
          </Button>
        </Section>
        <Text style={styles.dimmed}>
          <br />
          or copy and paste this URL into your browser:{" "}
          <Link href={url} target="_blank" style={styles.link} rel="noreferrer">
            {url}
          </Link>
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default ResetPassword;
