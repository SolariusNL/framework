import { createHandler, Post, Req, Res } from "@storyofams/next-api-decorators";
import { buffer } from "micro";
import type { NextApiRequest } from "next";
import Stripe from "stripe";
import prisma from "../../../util/prisma";
import { products } from "../../tickets/buy";

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
  apiVersion: "2022-11-15",
});

export const config = {
  api: {
    bodyParser: false,
  },
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
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, priceId } = session.metadata as {
          userId: string;
          priceId: string;
        };

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

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }

    return {
      received: true,
    };
  }
}

export default createHandler(WebhookRouter);
