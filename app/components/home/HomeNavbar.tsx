import { forwardRef, useEffect, useState } from "react";
import {
    Avatar,
    Divider,
    Group,
    Loader,
    Menu,
    Navbar,
    Text,
    ThemeIcon,
    UnstyledButton,
    useMantineTheme
} from "@mantine/core";
import { Book2, ChevronRight, DeviceGamepad, DeviceTv, LayoutBoard, Logout } from "tabler-icons-react";
import { Link, useFetcher, useSubmit } from "@remix-run/react";
import { UserLoaderData } from "~/routes/home/user";
import { GetUserResult } from "backend";

interface NavbarLinkProps {
    icon: React.ReactElement;
    label: string;
    color: string;
    to: string;
    onClick: () => void;
}

function NavbarLink({ icon, label, color, to, onClick }: NavbarLinkProps) {
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
                <ThemeIcon color={color} variant="light">
                    {icon}
                </ThemeIcon>

                <Text size="sm">{label}</Text>
            </Group>
        </UnstyledButton>
    );
}

interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
    profileImageURL: string | undefined;
    userName: string | undefined;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
    ({ profileImageURL, userName, ...others }: UserButtonProps, ref) => (
        <UnstyledButton
            ref={ref}
            sx={(theme) => ({
                display: 'block',
                width: '100%',
                padding: theme.spacing.md,
                color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

                '&:hover': {
                    backgroundColor:
                        theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                },
            })}
            {...others}
        >
            <Group>
                <Avatar src={profileImageURL} radius="xl"/>

                <div style={{ flex: 1 }}>
                    {userName ?
                        <Text px={4} size="sm" weight={500}>
                            {userName}
                        </Text> : <Loader size={"sm"} variant={"dots"}/>}
                </div>

                <ChevronRight size={18}/>
            </Group>
        </UnstyledButton>
    )
);

function NavbarUser() {
    const theme = useMantineTheme();
    const submit = useSubmit();

    const [user, setUser] = useState<GetUserResult>();

    const fetcher = useFetcher<UserLoaderData>();
    useEffect(() => {
        fetcher.submit({}, { action: "/home/user", method: "get" })
    }, []);
    useEffect(() => {
        if (fetcher.type == "done") {
            setUser(fetcher.data.user);
        }
    }, [fetcher.type]);

    return (
        <Group>
            <Menu
                sx={{ width: "100%" }}
                position="top"
                placement="end"
                control={
                    <UserButton
                        profileImageURL={""}
                        userName={user?.userName}
                    />
                }
            >
                <Menu.Label>Account</Menu.Label>
                <Menu.Item onClick={() => {
                    submit(null, { method: "post", action: "/account/logout" });
                }} icon={<Logout size={24} color={theme.colors.red[6]}/>}>Logout</Menu.Item>
            </Menu>
        </Group>
    );
}

interface HomeNavbarProps {
    opened: boolean;
    onNavigate: () => void;
}

export default function HomeNavbar({ opened, onNavigate }: HomeNavbarProps) {
    return (
        <Navbar p="md" hiddenBreakpoint="md" hidden={!opened} width={{ md: 300 }}>
            <Navbar p="xs" width={{ md: 300 }}>
                <Navbar.Section grow mt="xs">
                    <NavbarLink onClick={onNavigate} to={"/home"} icon={<LayoutBoard size={18}/>}
                                label={"Dashboard"} color={"gray"}/>
                    <NavbarLink onClick={onNavigate} to={"/home/games"} icon={<DeviceGamepad size={18}/>}
                                label={"Games"} color={"blue"}/>
                    <NavbarLink onClick={onNavigate} to={"/home/shows"} icon={<DeviceTv size={18}/>} label={"Shows"}
                                color={"red"}/>
                    <NavbarLink onClick={onNavigate} to={"/home/books"} icon={<Book2 size={18}/>} label={"Books"}
                                color={"yellow"}/>
                </Navbar.Section>
                <Divider my="sm"/>
                <Navbar.Section>
                    <NavbarUser/>
                </Navbar.Section>
            </Navbar>
        </Navbar>
    );
}