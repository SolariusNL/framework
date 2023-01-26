import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Preview } from "@react-email/preview";
import { Text } from "@react-email/text";
import { styles } from "./framework";
import EmailLayout from "./layout";

const VerificationConfirmation: React.FC = () => {
  return (
    <Html>
      <Head />
      <Preview>Verification confirmation</Preview>
      <EmailLayout
        title={<>Thanks for verifying your email</>}
        footer={
          <>
            If this wasn&apos;t you, immediately verify your account security,
            or contact us.
          </>
        }
      >
        <Text style={styles.text}>
          Thank you for verifying your email address on Framework. You can now
          create games, invite friends, and start playing.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default VerificationConfirmation;
