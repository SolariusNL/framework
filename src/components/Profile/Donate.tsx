import { Button, Menu } from "@mantine/core";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { HiOutlineShoppingBag, HiReceiptTax } from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import { NonUser } from "../../util/prisma-types";

interface DonateProps {
  user: NonUser;
}

const Donate = ({ user }: DonateProps) => {
  const router = useRouter();
  const currentUser = useFrameworkUser();

  const handleDonate = async (amt: number) => {
    await fetch(`/api/users/${user.id}/donate/${amt}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then(() =>
      router
        .replace({
          pathname: `/profile/${user.username}`,
          query: {
            status: "success",
          },
        })
        .then(() => router.reload())
    );
  };

  return (
    <Menu shadow="md" width={240}>
      <Menu.Target>
        <Button leftIcon={<HiReceiptTax />}>Donate</Button>
      </Menu.Target>
      <Menu.Dropdown>
        {[100, 200, 500, 1000, 2500, 5000, 10000].map((amount) => (
          <Menu.Item
            key={amount}
            icon={<HiOutlineShoppingBag />}
            disabled={amount > Number(currentUser?.tickets)}
            onClick={() => handleDonate(amount)}
          >
            Donate {amount} tickets
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Label>
          If you did not mean to donate, contact us and we will refund your
          donation.
        </Menu.Label>
      </Menu.Dropdown>
    </Menu>
  );
};

export default Donate;
