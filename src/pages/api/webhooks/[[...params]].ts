import { plans } from "@/pages/premium";
import { products } from "@/pages/tickets/buy";
import { PREMIUM_PAYOUTS } from "@/util/constants";
import createNotification from "@/util/notifications";
import prisma from "@/util/prisma";
import { NotificationType } from "@prisma/client";
import { Post, Req, createHandler } from "@storyofams/next-api-decorators";
import { buffer } from "micro";
import type { NextApiRequest } from "next";
import Stripe from "stripe";

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
  apiVersion: "2022-11-15",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const reasons = {
  chargeback:
    "Chargeback fraud - you've been terminated for engaging in fraudulent chargebacks.",
};

const banUser = async (userId: number, reason: string) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      banned: true,
      banReason: reason,
      banExpires: new Date(
        new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 1000
      ),
    },
  });
};

const checkoutSessionCompleted = async (event: Stripe.Event) => {
  const session = event.data.object as Stripe.Checkout.Session;
  const checkoutSession = await stripe.checkout.sessions.retrieve(session.id);
  const { userId, priceId } = session.metadata as {
    userId: string;
    priceId: string;
  };
  const cust = await prisma.customer.findFirst({
    where: {
      stripeCustomerId: session.customer as string,
    },
  });

  if (checkoutSession.mode === "subscription") {
    const premium = plans.find((p) => p.priceId === priceId);

    await prisma.user.update({
      where: {
        id: cust?.userId as number,
      },
      data: {
        premiumSubscription: {
          create: {
            type: premium!.type,
            stripeSubscriptionId: checkoutSession.subscription as string,
          },
        },
        premium: true,
        tickets: {
          increment: PREMIUM_PAYOUTS[premium!.type],
        },
      },
    });
    await createNotification(
      cust?.userId as number,
      NotificationType.GIFT,
      `Welcome to Framework Premium. You've received your first payout of ${
        PREMIUM_PAYOUTS[premium!.type]
      } tickets! Thank you for supporting us.`,
      "Welcome to Premium"
    );
  } else {
    const product = products.find((p) => p.priceId === priceId);

    await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        tickets: {
          increment: product!.grant,
        },
      },
    });
  }
};

const chargeDisputeCreated = async (event: Stripe.Event) => {
  const dispute = event.data.object as Stripe.Dispute;
  const paymentIntent = await stripe.paymentIntents.retrieve(
    dispute.payment_intent as string
  );
  const customer = await prisma.customer.findFirst({
    where: {
      stripeCustomerId: paymentIntent.customer as string,
    },
  });
  await banUser(customer?.userId as number, reasons.chargeback);
};

const customerSubscriptionDeleted = async (event: Stripe.Event) => {
  const subscription = event.data.object as Stripe.Subscription;
  const customer = await prisma.customer.findFirst({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
  });

  await prisma.user.update({
    where: {
      id: customer?.userId as number,
    },
    data: {
      premium: false,
      premiumSubscription: {
        delete: true,
      },
    },
  });

  await createNotification(
    customer?.userId as number,
    NotificationType.ALERT,
    "Your Framework Premium subscription has been cancelled. We're sorry to see you go!",
    "Premium cancelled"
  );
};

const invoicePaid = async (event: Stripe.Event) => {
  const invoice = event.data.object as Stripe.Invoice;
  if (invoice.billing_reason === "subscription_create") return;
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );
  const premiumSubscription = await prisma.premiumSubscription.findFirst({
    where: {
      stripeSubscriptionId: String(invoice.subscription),
    },
  });
  const customer = await prisma.customer.findFirst({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
  });

  await prisma.user.update({
    where: {
      id: customer?.userId as number,
    },
    data: {
      tickets: {
        increment: PREMIUM_PAYOUTS[premiumSubscription!.type],
      },
    },
  });

  await createNotification(
    customer?.userId as number,
    NotificationType.GIFT,
    `You've received your payout of ${
      PREMIUM_PAYOUTS[premiumSubscription!.type]
    } tickets! Thank you for supporting us.`,
    "Premium renewed"
  );
};

const customerSubscriptionUpdated = async (event: Stripe.Event) => {
  const subscription = event.data.object as Stripe.Subscription;
  const customer = await prisma.customer.findFirst({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
  });

  const plan = await stripe.plans.retrieve(subscription.items.data[0].price.id);
  const newPlan = plans.find((p) => p.priceId === plan.id);

  await prisma.user.update({
    where: {
      id: customer?.userId as number,
    },
    data: {
      premiumSubscription: {
        update: {
          type: newPlan!.type,
        },
      },
    },
  });
};

class WebhookRouter {
  @Post("/handle")
  public async handleWebhook(@Req() request: NextApiRequest) {
    const buf = await buffer(request);
    const sig = request.headers["stripe-signature"]! as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      return {
        statusCode: 400,
        body: `Webhook Error: ${err.message}`,
      };
    }

    switch (event.type) {
      case "checkout.session.completed":
        checkoutSessionCompleted(event);
        break;
      case "charge.dispute.created":
        chargeDisputeCreated(event);
        break;
      case "customer.subscription.deleted":
        customerSubscriptionDeleted(event);
        break;
      case "customer.subscription.updated":
        customerSubscriptionUpdated(event);
        break;
      case "invoice.paid":
        invoicePaid(event);
        break;
      default:
        break;
    }

    return {
      received: true,
    };
  }
}

export default createHandler(WebhookRouter);
