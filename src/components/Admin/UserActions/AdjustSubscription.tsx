import { Button, Modal, Select, Stack } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { PremiumSubscriptionType } from "@prisma/client";
import React, { useEffect } from "react";
import { HiCalendar, HiCreditCard, HiStop } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";
import Stateful from "../../Stateful";
import Action from "./Action";

interface AdjustSubscriptionProps {
  user: User;
}

const AdjustSubscription: React.FC<AdjustSubscriptionProps> & {
  title: string;
  description: string;
} = ({ user }) => {
  const form = useForm<{
    type: PremiumSubscriptionType | null;
    renew: Date | null;
  }>({
    initialValues: {
      type: user.premiumSubscription ? user.premiumSubscription.type : null,
      renew: user.premiumSubscription
        ? user.premiumSubscription.expiresAt
        : null,
    },
  });

  useEffect(() => {
    form.reset();
    form.setFieldValue("type", user.premiumSubscription?.type ?? null);
    form.setFieldValue("renew", user.premiumSubscription?.expiresAt ?? null);
  }, [user]);

  return (
    <Stateful>
      {(open, setOpen) => (
        <>
          <Action
            title="Adjust subscription"
            description="Adjust user's Premium subscription"
            onClick={() => setOpen(true)}
            icon={HiCreditCard}
          />
          <Modal
            title="Adjust user's subscription"
            onClose={() => setOpen(false)}
            opened={open}
          >
            <form
              onSubmit={form.onSubmit(async (values) => {
                await performAdminAction(
                  AdminAction.ADJUST_SUBSCRIPTION,
                  values,
                  user.id
                );
                setOpen(false);
              })}
            >
              <Stack spacing={12} mb="md">
                <Select
                  label="Subscription type"
                  description="User subscription type, rewards are granted accordingly"
                  data={Object.values(PremiumSubscriptionType).map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  placeholder="Select subscription type"
                  {...form.getInputProps("type")}
                />
                <DatePicker
                  label="Renewal date"
                  description="Date when the subscription will renew"
                  icon={<HiCalendar />}
                  placeholder="Enter a date"
                  value={
                    form.values.renew ? new Date(form.values.renew) : undefined
                  }
                  onChange={(date) => form.setFieldValue("renew", date)}
                />
              </Stack>
              <div className="flex justify-end gap-2">
                <Button
                  variant="default"
                  leftIcon={<HiStop />}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button leftIcon={<HiCreditCard />} type="submit">
                  Save
                </Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </Stateful>
  );
};

AdjustSubscription.title = "Adjust subscription";
AdjustSubscription.description = "Adjust user's Premium subscription";

export default AdjustSubscription;
