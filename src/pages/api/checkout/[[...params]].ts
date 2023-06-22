import {
  Body,
  createHandler,
  Get,
  Post,
  Query,
  Res,
} from "@storyofams/next-api-decorators";
import type { NextApiResponse } from "next";
import Stripe from "stripe";
import Authorized, { Account } from "../../../util/api/authorized";
import type { User } from "../../../util/prisma-types";

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
    },
    @Account() user: User
  ) {
    const { priceId } = body;

    const params: Stripe.Checkout.SessionCreateParams = {
      submit_type: "pay",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        userId: user.id,
        priceId,
      },
      success_url: `${
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://framework.solarius.me"
      }/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://framework.solarius.me"
      }/api/checkout/cancel`,
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
      return response.redirect(302, "/tickets/success");
    }

    return {
      session,
    };
  }

  @Get("/cancel")
  public async cancel(@Res() response: NextApiResponse) {
    return response.redirect(302, "/tickets");
  }
}

export default createHandler(CheckoutRouter);
