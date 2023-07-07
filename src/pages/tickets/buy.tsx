import CheckboxCard from "@/components/CheckboxCard";
import Framework from "@/components/Framework";
import authorizedRoute from "@/util/auth";
import getStripe from "@/util/get-stripe";
import { User } from "@/util/prisma-types";
import { Accordion, Badge, Button, Stack, Text, Title } from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useState } from "react";
import { HiCheck, HiLockClosed } from "react-icons/hi";

interface BuyTicketsProps {
  user: User;
}

/**
 * Since Framework is still in development,
 * we override the price ID with a test price ID.
 */
export const products = [
  {
    name: "1,000T$",
    priceId: "price_1M5BNfKrKkWmvq0RofjjWGf0",
    price: "€9.99",
    grant: 1000,
  },
  {
    name: "2,400T$",
    priceId: "price_1M5BOqKrKkWmvq0RaskrxAIz",
    price: "€19.99",
    grant: 2400,
  },
  {
    name: "5,000T$",
    priceId: "price_1M5IK0KrKkWmvq0RBe4RgCQa",
    price: "€39.99",
    grant: 5000,
    goodDeal: true,
    rawPrice: 39.99,
    percentOff: 10,
    altPrice: 49.99,
  },
  {
    name: "10,000T$",
    priceId: "price_1M6neqKrKkWmvq0RjvITQpeY",
    price: "€79.99",
    grant: 10000,
    goodDeal: true,
    rawPrice: 79.99,
    percentOff: 20,
    altPrice: 99.99,
  },
];

const BuyTickets: NextPage<BuyTicketsProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(1);

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
        type: "tickets",
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
          <Accordion defaultValue="about" mb={12}>
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
          <Text color="dimmed" size="sm" mb={6}>
            Terms and conditions apply. By purchasing tickets, you agree to our
            Terms of Service and Privacy Policy. You will be charged the price
            shown above. At any time, we reserve the right to modify or revoke
            your tickets, and/or ban you from the service for violating our
            Terms of Service.
          </Text>
          <Text color="dimmed" size="sm" mb={6}>
            You will be charged in EUR. If you are not in the EU, your bank may
            charge you an additional fee. We are not responsible for any fees
            charged by your bank. Solarius reserves the right to change prices,
            at any time. We cannot be held liable for fees associated with
            currency exchange.
          </Text>
        </div>
        <div className="flex-1">
          <Stack spacing={12}>
            {products.map((product, i) => (
              <CheckboxCard
                key={i}
                title={
                  <div>
                    <div className="flex items-center gap-2">
                      <Text
                        color="dimmed"
                        size="sm"
                        weight={500}
                        sx={{
                          textDecoration: product.goodDeal
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {product.goodDeal
                          ? `€${product.altPrice}`
                          : product.price}
                      </Text>
                      {product.goodDeal && (
                        <Text color="dimmed" size="sm" weight={700}>
                          {product.price}
                        </Text>
                      )}
                    </div>
                    <div className="items-center flex gap-2">
                      <Title order={4}>{product.name}</Title>
                      {product.goodDeal && (
                        <Badge
                          variant="gradient"
                          gradient={{
                            from: "pink",
                            to: "grape",
                          }}
                        >
                          {product.grant === 5000
                            ? "10% off"
                            : product.grant === 10000
                            ? "20% off"
                            : ""}
                        </Badge>
                      )}
                    </div>
                  </div>
                }
                description={`You will receive ${product.grant} tickets.`}
                checked={selected === i}
                onChange={() => setSelected(i)}
              />
            ))}
          </Stack>
          <Button
            fullWidth
            onClick={handler}
            loading={loading}
            mt={24}
            leftIcon={<HiCheck />}
            size="lg"
          >
            Purchase
          </Button>
          <div className="mt-4 flex justify-center items-center gap-2">
            <HiLockClosed className="text-green-600 flex-shrink-0" />
            <Text color="green" size="sm">
              Secure Checkout
            </Text>
          </div>
          <div className="mt-1 flex justify-center text-center">
            <Text size="sm" color="dimmed">
              All transactions are secure as long as you see the lock icon in
              the address bar.
            </Text>
          </div>
        </div>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default BuyTickets;
