import AdjustEmployee from "@/components/Admin/UserActions/AdjustEmployee";
import AdjustTickets from "@/components/Admin/UserActions/AdjustTickets";
import LogoutSessions from "@/components/Admin/UserActions/LogoutSessions";
import ResetBio from "@/components/Admin/UserActions/ResetBio";
import ResetEmail from "@/components/Admin/UserActions/ResetEmail";
import ResetPassword from "@/components/Admin/UserActions/ResetPassword";
import ResetUsername from "@/components/Admin/UserActions/ResetUsername";
import SendEmail from "@/components/Admin/UserActions/SendEmail";
import Unban from "@/components/Admin/UserActions/Unban";
import Unwarn from "@/components/Admin/UserActions/Unwarn";
import Verify from "@/components/Admin/UserActions/Verify";
import ModernEmptyState from "@/components/ModernEmptyState";
import ShadedCard from "@/components/ShadedCard";
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
