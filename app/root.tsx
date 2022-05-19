import { ButtonStylesParams, MantineProvider, MantineThemeOverride } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "@remix-run/react";
import styles from "~/styles/root.css";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";

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
