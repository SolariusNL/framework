function clsx(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default clsx;
