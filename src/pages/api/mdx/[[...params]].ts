import IResponseBase from "@/types/api/IResponseBase";
import { Body, Get } from "@solariusnl/next-api-decorators";
import { serialize } from "next-mdx-remote/serialize";

class MdxRouter {
  @Get("/serialize")
  public async serializeMarkdown(@Body() body: { markdown: string }) {
    const { markdown } = body;

    if (!markdown) {
      return <IResponseBase>{
        success: false,
        message: "No markdown provided",
      };
    }

    const mdxSource = await serialize(markdown);

    return <IResponseBase>{
      success: true,
      data: {
        mdxSource,
      },
    };
  }
}

export default MdxRouter;
