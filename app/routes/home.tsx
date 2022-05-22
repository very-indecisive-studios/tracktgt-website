import { LoaderFunction, redirect } from "@remix-run/node";
import React, { ReactNode, useEffect, useState } from 'react';
import {
    AppShell,
    Header,
    Image,
    MediaQuery,
    Burger,
    useMantineTheme,
    Grid, Progress, MantineProvider, Center, Container, Stack, Title,
} from '@mantine/core';
import HomeNavbar from "~/components/HomeNavbar";
import { Links, Meta, Outlet, Scripts, useCatch, useFetcher, useTransition } from "@remix-run/react";
import SearchBar from "~/components/SearchBar";
import { requireAuthInfo } from "~/utils/session.server";
import { checkUserVerification } from "../../auth";
import { MoodConfuzed, QuestionMark } from "tabler-icons-react";

export const loader: LoaderFunction = async ({request}) => {
    // Redirect to login if user is not signed in.
    const authInfo = await requireAuthInfo(request);
    const isUserVerified = await checkUserVerification(authInfo.idToken);
    if (!isUserVerified) {
        return redirect("/account/verify");
    }
    
    return null;
}

const LoadingIndicator = () => {
    const transition = useTransition();
    
    const [intervalId, setIntervalId] = useState(0);
    const [progressVal, setProgressVal] = useState(0);
    useEffect(() => {
        if (transition.state === "submitting" || transition.state === "loading") {
            window.clearInterval(intervalId)
            setProgressVal(0);
            
            function increaseMyVar()
            {
                const maxValue = 100;
                setProgressVal((value) => ++value % maxValue);
            }

            setIntervalId(window.setInterval(increaseMyVar,20))
        } else {
            setProgressVal(0);
            window.clearInterval(intervalId)
        }
        
        return () => { window.clearInterval(intervalId) };
    }, [transition.state])

    return (
        <>
            <Progress radius={"xs"} 
                      color={"indigo"}
                      size={"sm"}
                      value={progressVal} 
                      hidden={transition.state === "idle"}
                      sx={(theme) => ({
                          zIndex: 101,
                          position: "fixed",
                          width: "100vw"
                      })}/>
        </>
    );
}

interface ShellProps {
    children?: ReactNode
}

const Shell = ({ children }: ShellProps) => {
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);

    return (
        <AppShell
            styles={{
                main: {
                    background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                },
            }}
            navbarOffsetBreakpoint="sm"
            asideOffsetBreakpoint="sm"
            fixed
            navbar={
                <HomeNavbar opened={opened} />
            }
            header={
                <Header height={70} p="md">
                    <MediaQuery smallerThan="md" styles={{display: 'none'}}>
                        <Grid columns={12} align={"center"}>
                            <Grid.Col span={3}>
                                <Image fit={"contain"} height={32} width={64} src="/logo.svg">tracktgt</Image>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <SearchBar/>
                            </Grid.Col>
                            <Grid.Col span={3}>
                            </Grid.Col>
                        </Grid>
                    </MediaQuery>
                    <MediaQuery largerThan="md" styles={{display: 'none'}}>
                        <Grid columns={12} align={"center"}>
                            <Grid.Col span={1}>
                                <Burger
                                    opened={opened}
                                    onClick={() => setOpened((o) => !o)}
                                    size="sm"
                                    color={theme.colors.gray[6]}
                                    mr="xl"
                                />
                            </Grid.Col>
                            <Grid.Col span={2}>
                                <Image fit={"contain"} height={32} width={64} src="/logo.svg">tracktgt</Image>
                            </Grid.Col>
                            <Grid.Col span={4}>
                            </Grid.Col>
                        </Grid>
                    </MediaQuery>
                </Header>
            }
        >
            {children}
        </AppShell>
    );
}

export default function Home() {
    // Refresh user session.
    const fetcher = useFetcher();
    useEffect(() => {
        const id = window.setInterval(() => {
            fetcher.submit(null, { method: "post", action: "/account/session"})
        }, 300000)
        
        return () => window.clearInterval(id);
    }, []);
    
    return (
        <>
            <LoadingIndicator/>
            <Shell>
                <Outlet/>
            </Shell>
        </>
    );
}

interface ErrorBoundaryProps {
    error: Error;
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
    console.error(error);

    return (
        <Shell>
            <Center sx={(theme) => ({
                width: "100%",
                height: "100%"
            })}>
                <Container size={"xs"}>
                    <Stack align={"center"}>
                        <MoodConfuzed size={96} />
                        <Title mt={24} order={1}>Something went wrong!</Title>
                    </Stack>
                </Container>
            </Center>
        </Shell>
    );
}

export function CatchBoundary() {
    const caught = useCatch();

    return (
        <Shell>
            bruh?
            <Center sx={(theme) => ({
                width: "100%",
                height: "100%"
            })}>
                <Container size={"xs"}>
                    <Stack align={"center"}>
                        <QuestionMark size={96}/>
                        <Title mt={24} order={1}>bruh wtf?? {caught.status} {caught.statusText}</Title>
                    </Stack>
                </Container>
            </Center>
        </Shell>
    );
}
