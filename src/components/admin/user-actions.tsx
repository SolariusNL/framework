import AdjustEmployee from "@/components/admin/user-actions/adjust-employee";
import AdjustTickets from "@/components/admin/user-actions/adjust-tickets";
import LogoutSessions from "@/components/admin/user-actions/logout-sessions";
import ResetBio from "@/components/admin/user-actions/reset-bio";
import ResetEmail from "@/components/admin/user-actions/reset-email";
import ResetPassword from "@/components/admin/user-actions/reset-password";
import ResetUsername from "@/components/admin/user-actions/reset-username";
import SendEmail from "@/components/admin/user-actions/send-email";
import Unban from "@/components/admin/user-actions/unban";
import Unwarn from "@/components/admin/user-actions/unwarn";
import Verify from "@/components/admin/user-actions/verify";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import { User } from "@/util/prisma-types";
import { Pagination, Stack, TextInput } from "@mantine/core";
import { AdminPermission } from "@prisma/client";
import { useCallback, useRef, useState } from "react";
import ReactNoSSR from "react-no-ssr";

const actions = [
  AdjustTickets,
  ResetUsername,
  LogoutSessions,
  ResetEmail,
  ResetPassword,
  ResetBio,
  AdjustEmployee,
  Unban,
  Unwarn,
  SendEmail,
  Verify,
];

const ActionList: React.FC<{
  target: User;
  actionSearch: string;
  actionPage: number;
}> = ({ target, actionSearch, actionPage }) => {
  const { user } = useAuthorizedUserStore()!;

  return (
    <>
      {user?.adminPermissions.includes(AdminPermission.RUN_ACTIONS) ? (
        actions
          .filter((a) => a.title.toLowerCase().includes(actionSearch))
          .slice((actionPage - 1) * 5, actionPage * 5)
          .map((Action, i) => (
            <ReactNoSSR key={i}>
              <Action user={target} />
            </ReactNoSSR>
          ))
      ) : (
        <ModernEmptyState
          title="No actions available"
          body="You do not have permission to run actions."
        />
      )}
    </>
  );
};

const Search = ({ value, onChange, ref }: any) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );
  return (
    <TextInput
      ref={ref}
      placeholder="Search actions"
      defaultValue={value}
      onChange={handleChange}
      mb="md"
      key="action-search-input"
    />
  );
};

const UserActions: React.FC<{ target: User }> = ({ target }) => {
  const [actionSearch, setActionSearch] = useState("");
  const [actionPage, setActionPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <ShadedCard>
      <Search ref={searchRef} value={actionSearch} onChange={setActionSearch} />
      <div className="w-full flex justify-center mb-5">
        <Pagination
          total={Math.ceil(actions.length / 5)}
          page={actionPage}
          onChange={setActionPage}
          radius="md"
        />
      </div>
      <Stack spacing={12}>
        <ActionList
          target={target}
          actionSearch={actionSearch}
          actionPage={actionPage}
        />
      </Stack>
    </ShadedCard>
  );
};

export default UserActions;
