import { GetServerSideProps } from "next";
import authorizedRoute from "./auth";

export const getAdminSSP: GetServerSideProps = async (ctx) => {
  const auth = await authorizedRoute(ctx, true, false, true);

  if (auth.redirect) return auth;

  return {
    props: {
      user: auth.props.user,
    },
  };
};
