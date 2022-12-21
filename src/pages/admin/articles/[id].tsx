import { TypographyStylesProvider } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Framework from "../../../components/Framework";
import authorizedRoute from "../../../util/authorizedRoute";
import prisma from "../../../util/prisma";
import { Article, articleSelect, User } from "../../../util/prisma-types";

interface ArticleViewProps {
  user: User;
  article: Article;
}

const ArticleView: NextPage<ArticleViewProps> = ({ user, article }) => {
  return (
    <Framework
      user={user}
      modernTitle={article.title}
      modernSubtitle="View an article written by a staff member"
      activeTab="none"
      returnTo={{
        label: "Go back to articles",
        href: "/admin/articles",
      }}
    >
      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </TypographyStylesProvider>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false, true);
  const { id } = context.query;

  if (auth.redirect) {
    return auth;
  }

  const article = await prisma.adminArticle.findFirst({
    where: {
      id: String(id),
    },
    select: articleSelect,
  });

  return {
    props: {
      user: auth.props.user,
      article: JSON.parse(JSON.stringify(article)),
    },
  };
}

export default ArticleView;
