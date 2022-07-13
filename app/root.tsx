import { ButtonStylesParams, MantineProvider, MantineThemeOverride, useMantineTheme } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch, } from "@remix-run/react";
import styles from "~/styles/root.css";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { MoodConfuzed, QuestionMark } from "tabler-icons-react";

export function links() {
    return [{ rel: "stylesheet", href: styles }];
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

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
    console.error(error);

    const theme = useMantineTheme();

    return (
        <html>
        <head>
            <title>Oh no!</title>
            <Meta/>
            <Links/>
        </head>
        <body style={{
            margin: "0px",
            fontFamily: "Poppins"
        }}>
        <div style={{
            width: "100vw",
            height: "100vh",
            background: theme.colors.gray[9],
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            justifyContent: "center",
        }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: theme.colors.gray[0]
            }}>
                <MoodConfuzed size={96}/>
                <h1>Something went wrong!</h1>
                <p>
                    Try refreshing the page. If the issue still persists, please report it via the button below.
                </p>
                <a href={"https://forms.gle/GfCAhv2HeUWjS7Ug6"}>
                    Report issue
                </a>
            </div>
        </div>
        <Scripts/>
        </body>
        </html>
    );
}

export function CatchBoundary() {
    const caught = useCatch();
    const theme = useMantineTheme();

    return (
        <html>
        <head>
            <title>Oh no!</title>
            <Meta/>
            <Links/>
        </head>
        <body style={{
            margin: "0px",
            fontFamily: "Poppins"
        }}>
        <div style={{
            width: "100vw",
            height: "100vh",
            background: theme.colors.gray[9],
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            justifyContent: "center",
        }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: theme.colors.gray[0]
            }}>
                <QuestionMark size={96}/>
                <h1>{caught.status} {caught.statusText}</h1>
            </div>
        </div>
        <Scripts/>
        </body>
        </html>
    );
}