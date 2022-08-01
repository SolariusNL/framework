import { Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface CatalogProps {
  user: User;
}

const Catalog: NextPage<CatalogProps> = ({ user }) => {
  return (
    <Framework user={user} activeTab="catalog">
      <Title mb={24}>Catalog</Title>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Catalog;
