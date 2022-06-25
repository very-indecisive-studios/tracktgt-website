import { LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useMobileQuery } from "~/utils/hooks";
import { Box, Container, Grid, Group, Text, ThemeIcon, Title, UnstyledButton } from "@mantine/core";
import React from "react";
import { Link, Outlet } from "@remix-run/react";
import { CurrencyDollar, User } from "tabler-icons-react";

//region Server

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request);

    return null;
}

//endregion

//region Client

interface NavbarLinkProps {
    icon: React.ReactElement;
    label: string;
    to: string;
    onClick: () => void;
}

function NavbarLink({ icon, label, to, onClick }: NavbarLinkProps) {
    return (
        <UnstyledButton
            onClick={onClick}
            component={Link}
            to={to}
            sx={(theme) => ({
                display: 'block',
                width: '100%',
                padding: theme.spacing.xs,
                borderRadius: theme.radius.sm,
                color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

                '&:hover': {
                    backgroundColor:
                        theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                },
            })}
        >
            <Group>
                <ThemeIcon color={"gray"} variant="light">
                    {icon}
                </ThemeIcon>

                <Text size="sm">{label}</Text>
            </Group>
        </UnstyledButton>
    );
}

export default function Settings() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Settings</Title>
            
            <Grid columns={isMobile ? 1 : 4}>
                <Grid.Col span={1}>
                    <Box px={4} py={8} sx={(theme) => ({
                        border: "solid 2px",
                        borderRadius: "4px",
                        borderColor: theme.colors.gray[8]
                    })}>
                        <NavbarLink onClick={() => {}}
                                    to={"/home/settings"}
                                    icon={<User size={18}/>}
                                    label={"Account"} />
                        <NavbarLink onClick={() => {}} 
                                    to={"/home/settings/pricing"} 
                                    icon={<CurrencyDollar size={18}/>} 
                                    label={"Pricing"} />
                    </Box>
                </Grid.Col>
                <Grid.Col span={isMobile ? 1 : 3}>
                    <Outlet />
                </Grid.Col>
            </Grid>
        </Container>
    );
}

//endregion