import {
    ButtonStylesParams, Center,
    Container,
    MantineProvider,
    MantineThemeOverride,
    Stack,
    Title
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration, useCatch,
} from "@remix-run/react";
import styles from "~/styles/root.css";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { MoodConfuzed, QuestionMark } from "tabler-icons-react";

export function links() {
    return [{rel: "stylesheet", href: styles}];
}

const appTheme: MantineThemeOverride = {
    fontFamily: "'DM Sans'",
    headings: {
        fontFamily: "Poppins"
    },
    colorScheme: 'dark',
    primaryColor: 'indigo',
};

export const meta: MetaFunction = () => ({
    charset: "utf-8",
    title: "TrackTogether",
    viewport: "width=device-width,initial-scale=1",
});

export default function App() {
    return (
        <html lang="en">
        <head>
            <Meta/>
            <Links/>
        </head>
        <body>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={appTheme} styles={{
            Button: (theme, params: ButtonStylesParams) => ({
                root: {
                    fontWeight: 400
                }
            })
        }}>
            <ModalsProvider>
                <NotificationsProvider autoClose={5000}>
                    <Outlet/>
                </NotificationsProvider>
            </ModalsProvider>
        </MantineProvider>
        <ScrollRestoration/>
        <Scripts/>
        <LiveReload/>
        </body>
        </html>
    );
}

interface ErrorBoundaryProps {
    error: Error;
}

export function ErrorBoundary({error}: ErrorBoundaryProps) {
    console.error(error);

    return (
        <html>
        <head>
            <title>Oh no!</title>
            <Meta/>
            <Links/>
        </head>
        <body>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={appTheme}>
            <Center sx={(theme) => ({
                width: "100vw",
                height: "100vh"
            })}>
                <Container size={"xs"}>
                    <Stack align={"center"}>
                        <MoodConfuzed size={96}/>
                        <Title mt={24} order={1}>Something went wrong!</Title>
                    </Stack>
                </Container>
            </Center>
        </MantineProvider>

        <Scripts/>
        </body>
        </html>
    );
}

export function CatchBoundary() {
    const caught = useCatch();
    
    return (
        <html>
        <head>
            <title>Oh no!</title>
            <Meta/>
            <Links/>
        </head>
        <body>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={appTheme}>
            <Center sx={(theme) => ({
                width: "100vw",
                height: "100vh"
            })}>
                <Container size={"xs"}>
                    <Stack align={"center"}>
                        <QuestionMark size={96}/>
                        <Title mt={24} order={1}>{caught.status} {caught.statusText}</Title>
                    </Stack>
                </Container>
            </Center>
        </MantineProvider>

        <Scripts/>
        </body>
        </html>
    );
}