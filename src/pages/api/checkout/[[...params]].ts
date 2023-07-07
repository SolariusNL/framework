import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import {
  Body,
  Get,
  Post,
  Query,
  Res,
  createHandler,
} from "@storyofams/next-api-decorators";
import type { NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
  apiVersion: "2022-11-15",
});

class CheckoutRouter {
  @Post("/createsession")
  @Authorized()
  public async createStripeSession(
    @Body()
    body: {
      priceId: string;
      type: "tickets" | "premium";
    },
    @Account() user: User
  ) {
    const { priceId, type = "tickets" } = body;
    const customer = await prisma.customer.findFirst({
      where: {
        userId: user.id,
      },
    });
    let stripeCustomer;

    if (!customer) {
      const cust = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
        name: user.username,
      });
      await prisma.customer.create({
        data: {
          userId: user.id,
          stripeCustomerId: cust.id,
          email: user.email,
        },
      });

      stripeCustomer = cust;
    } else {
      await stripe.customers.retrieve(customer.stripeCustomerId).then((c) => {
        stripeCustomer = c;
      });
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: type === "tickets" ? "payment" : "subscription",
      metadata: {
        userId: user.id,
        priceId,
      },
      customer: stripeCustomer?.id,
      success_url: `${
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:3000"
          : "https://framework.solarius.me"
      }/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:3000"
          : "https://framework.solarius.me"
      }/api/checkout/cancel`,
      allow_promotion_codes: true,
      ...(type === "tickets"
        ? {
            submit_type: "pay",
          }
        : {}),
    };

    const session: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create(params);

    return {
      sessionId: session.id,
    };
  }

  @Get("/success")
  public async success(
    @Query("session_id") sessionId: string,
    @Res() response: NextApiResponse
  ) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.mode === "payment")
        return response.redirect(302, "/tickets/success");
      else
        return response.redirect(
          302,
          "/settings/subscriptions?success=subscription"
        );
    }

    return {
      session,
    };
  }

  @Post("/createportal")
  @Authorized()
  public async createPortal(@Account() user: User) {
    const customer = await prisma.customer.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!customer) {
      return {
        message: "You don't have a Stripe account yet.",
        success: false,
      };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: `${
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:3000"
          : "https://framework.solarius.me"
      }/settings/subscriptions`,
    });
    console.log(session);

    return {
      data: {
        url: session.url,
      },
      success: true,
    };
  }

  @Get("/cancel")
  public async cancel(@Res() response: NextApiResponse) {
    return response.redirect(302, "/tickets");
  }
}

export default createHandler(CheckoutRouter);
