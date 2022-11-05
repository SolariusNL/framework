const getFileFromImg = (imgString: string): File => {
  return new File(
    [Buffer.from(imgString.replace(/^data:image\/\w+;base64,/, ""), "base64")],
    "avatar.jpeg",
    {
      type: "image/jpeg",
    }
  );
};

export default getFileFromImg;
