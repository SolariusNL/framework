function clsx(...args: (string | undefined | null | false)[]) {
  return args.filter(Boolean).join(" ");
}

export default clsx;
