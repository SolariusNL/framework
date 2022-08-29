function generateGiftCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 20; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  code =
    code.slice(0, 4) +
    "-" +
    code.slice(4, 8) +
    "-" +
    code.slice(8, 12) +
    "-" +
    code.slice(12, 16) +
    "-" +
    code.slice(16, 20);
  return code;
}

export default generateGiftCode;
