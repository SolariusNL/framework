import { Anchor, Badge, Box, Container, Group, Text, Title } from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import { HiArrowLeft } from "react-icons/hi";

type NavHeaderProps = {
  immersive: boolean;
  noContentPadding: boolean;
  title: string;
  beta?: boolean;
  subtitle: string;
  returnTo?: {
    href: string;
    label: string;
  };
  mobile: boolean;
  actions?: [string | React.ReactNode, () => void][];
  integratedTabs?: React.ReactNode;
}

const NavHeader: FC<NavHeaderProps> = ({
  immersive,
  noContentPadding,
  title,
  beta,
  subtitle,
  returnTo,
  mobile,
  actions,
  integratedTabs
}) => {
  return (
    <Box
            sx={(theme) => ({
              backgroundColor: theme.colorScheme === "dark" ? "#000" : "#fff",
              position: immersive ? "sticky" : "relative",
              top: immersive ? "108.7px" : "0",
            })}
            mb={noContentPadding ? 0 : 32}
            p={32}
          >
            <Container>
              <Group position="apart">
                <div>
                  <Title mb={8}>
                    {title}
                    {beta && (
                      <Badge
                        sx={{
                          verticalAlign: "middle",
                        }}
                        ml={12}
                      >
                        Beta
                      </Badge>
                    )}
                  </Title>
                  <Text color="dimmed">{subtitle}</Text>
                  {returnTo && (
                    <Link href={returnTo.href} passHref>
                      <Anchor
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                        mt={16}
                      >
                        <HiArrowLeft />
                        {returnTo.label}
                      </Anchor>
                    </Link>
                  )}
                </div>
                <div className={mobile ? "flex gap-2" : ""}>
                  {actions && (
                    <div>
                      {actions.map(([label, onClick], index) => (
                        <Anchor
                          key={index}
                          onClick={onClick}
                          sx={(theme) => ({
                            color:
                              theme.colorScheme === "dark" ? "#fff" : "#000",
                            "&:after": {
                              content: "''",
                              display: "block",
                              width: "100%",
                              height: "2px",
                              backgroundColor:
                                theme.colorScheme === "dark"
                                  ? "#fff"
                                  : "#000" + "80",
                              transform: "scaleX(0)",
                              transition: "transform 0.3s ease-in-out",
                            },
                            fontWeight: 500,
                          })}
                        >
                          {label}
                        </Anchor>
                      ))}
                    </div>
                  )}
                </div>
              </Group>
              {integratedTabs && <div className="mt-8">{integratedTabs}</div>}
            </Container>
          </Box>
  );
};

export default NavHeader;