import {
  Accordion,
  Badge,
  Button,
  Divider,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useState } from "react";
import { HiCheck } from "react-icons/hi";
import CheckboxCard from "../../components/CheckboxCard";
import Framework from "../../components/Framework";
import authorizedRoute from "../../util/authorizedRoute";
import getStripe from "../../util/getStripe";
import { User } from "../../util/prisma-types";

interface BuyTicketsProps {
  user: User;
}

/**
 * Since Framework is still in development,
 * we override the price ID with a test price ID.
 */
export const products = [
  {
    name: "Tickets 1000",
    priceId: "price_1M5GjkKrKkWmvq0Ri9nmHUuO",
    price: "€9.99",
    grant: 1000,
  },
  {
    name: "Tickets 2400",
    priceId: "price_1M5HinKrKkWmvq0RolhK59CB",
    price: "€19.99",
    grant: 2400,
  },
  {
    name: "Tickets 5000",
    priceId: "price_1M5HjFKrKkWmvq0RhmJdEZga",
    price: "€39.99",
    grant: 5000,
    goodDeal: true,
  },
  {
    name: "Tickets 10000",
    priceId: "price_1M5HjjKrKkWmvq0RUHMYV0Zn",
    price: "€79.99",
    grant: 10000,
    goodDeal: true,
  },
];

const BuyTickets: NextPage<BuyTicketsProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  const handler = async () => {
    setLoading(true);

    await fetch("/api/checkout/createsession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        priceId: String(products[selected].priceId),
      }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        const stripe = await getStripe();
        const { error } = await stripe!.redirectToCheckout({
          sessionId: res.sessionId,
        });

        if (error) {
          console.error(error);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Framework
      activeTab="none"
      user={user}
      modernTitle="Buy Tickets"
      modernSubtitle="Use Tickets to customize your avatar, and buy digital goods!"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Text color="dimmed" mb={6}>
            Purchase Tickets
          </Text>
          <Title order={2} mb={24}>
            Choose a package
          </Title>
          <Accordion>
            <Accordion.Item value="about">
              <Accordion.Control>About Tickets</Accordion.Control>
              <Accordion.Panel>
                Tickets are a virtual currency useed on Framework that are used
                to purchase digital goods, customize avatar, fund projects, and
                many more! Tickets are not refundable, and cannot be transferred
                to other users.
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="privacy">
              <Accordion.Control>Privacy Policy</Accordion.Control>
              <Accordion.Panel>
                We use a third-party service called Stripe to process payments.
                Stripe collects your payment information and sends it to your
                bank to process the payment. We do not store any of your payment
                information. By purchasing tickets, you agree to Stripes Terms
                of Service and Privacy Policy.
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="purchase">
              <Accordion.Control>Purchase</Accordion.Control>
              <Accordion.Panel>
                Tickets are a one-time purchase, and are not refundable. By
                purchasing tickets, you agree to our Terms of Service and
                Privacy Policy. At any time, we reserve the right to modify or
                revoke your tickets, and/or ban you from the service for
                violating our Terms of Service.
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </div>
        <div className="flex-1">
          <Stack spacing={12}>
            {products.map((product, i) => (
              <CheckboxCard
                key={i}
                title={
                  <div className="items-center flex gap-2">
                    <Title order={5}>{product.name}</Title>
                    {product.goodDeal && (
                      <Badge variant="filled">Good Deal</Badge>
                    )}
                  </div>
                }
                description={`You will receive ${product.grant} tickets.`}
                checked={selected === i}
                onChange={() => setSelected(i)}
                style={{
                  border: product.goodDeal
                    ? "2px solid #3b82f6"
                    : "2px solid transparent",
                }}
              />
            ))}
          </Stack>
          <Button
            fullWidth
            onClick={handler}
            loading={loading}
            mt={24}
            leftIcon={<HiCheck />}
          >
            Purchase
          </Button>
        </div>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default BuyTickets;
