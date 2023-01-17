import { Button, NumberInput, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { HiCheckCircle, HiGift, HiTicket, HiUsers } from "react-icons/hi";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import { User } from "../../util/prisma-types";
import Grouped from "./Grouped";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

interface ReferralsTabProps {
  user: User;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ user: _user }) => {
  const { user, setProperty } = useAuthorizedUserStore();
  const enterForm = useForm<{ code: number }>({
    initialValues: {
      code: 0,
    },
    validate: {
      code: (value) => {
        if (
          value < 10000000 ||
          value > 99999999 ||
          value === Number(user?.referral?.code)
        ) {
          return "Invalid code";
        }
      },
    },
  });

  const createReferral = async () => {
    await fetch("/api/referrals/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setProperty("referral", {
          code: res.code,
          _count: {
            usedBy: 0,
          },
        });
      });
  };

  const enterReferral = async (code: number) => {
    await fetch("/api/referrals/enter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        code,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          showNotification({
            title: "Success",
            message:
              "You have entered the referral code and earned 150 tickets.",
            icon: <HiCheckCircle />,
          });
          setProperty("tickets", user?.tickets! + 150);
          setProperty("usedReferral", {
            code,
          });
        }
      });
  };

  return (
    <SettingsTab tabTitle="Referrals" tabValue="referrals">
      {user?.referral ? (
        <>
          <Grouped title="Referral Code">
            <SideBySide
              title="Your referral code"
              description="Share this code with new friends to earn you both 150 tickets!"
              icon={<HiTicket />}
              right={
                <div className="w-full flex items-center flex-col justify-center">
                  <Text color="dimmed" size="sm">
                    Your code is:
                  </Text>
                  <Title order={2}>{user.referral.code}</Title>
                </div>
              }
              shaded
              noUpperBorder
            />
            <SideBySide
              title="Uses"
              description="How many people have used your referral code."
              icon={<HiUsers />}
              right={
                <div className="w-full flex items-center flex-col justify-center">
                  <Text color="dimmed" size="sm">
                    Used by:
                  </Text>
                  <div className="flex items-center gap-2">
                    <Title order={2}>{user.referral._count.usedBy}</Title>
                    <Text color="dimmed" size="sm">
                      users
                    </Text>
                  </div>
                </div>
              }
              shaded
              noUpperBorder
            />
            {!user?.usedReferral &&
              new Date(user?.createdAt!).getTime() + 2592000000 >
                Date.now() && (
                <SideBySide
                  title="Enter code"
                  description="Enter a referral code to earn 150 tickets."
                  icon={<HiGift />}
                  right={
                    <form
                      onSubmit={enterForm.onSubmit(async (values) => {
                        await enterReferral(values.code);
                      })}
                    >
                      <NumberInput
                        label="Code"
                        description="Enter the code you were given."
                        required
                        min={10000000}
                        max={99999999}
                        mb="sm"
                        hideControls
                        {...enterForm.getInputProps("code")}
                      />
                      <Button variant="subtle" type="submit" fullWidth>
                        Submit
                      </Button>
                    </form>
                  }
                  shaded
                  noUpperBorder
                />
              )}
          </Grouped>
        </>
      ) : (
        <Grouped title="Referral Code">
          <SideBySide
            title="Create a referral code"
            description="Create a referral code to earn 150 tickets for each time it is used."
            icon={<HiTicket />}
            right={
              <Button
                leftIcon={<HiTicket />}
                onClick={createReferral}
                fullWidth
              >
                Create a referral code
              </Button>
            }
            shaded
            noUpperBorder
          />
        </Grouped>
      )}
    </SettingsTab>
  );
};

export default ReferralsTab;
