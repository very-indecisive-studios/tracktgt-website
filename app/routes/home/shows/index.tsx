import { LoaderFunction } from "@remix-run/node";
import React from "react";
import { Container, Tabs, Title } from "@mantine/core";
import { Eye } from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import { useMobileQuery } from "~/utils/hooks";
import tabStyles from "~/styles/tabStyles";
import ShowTrackingStatusTabs from "~/components/home/shows/ShowTrackingStatusTabs";

//region Server

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request);

    return null;
}

//endregion

//region Client

export default function Shows() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Shows</Title>

            <Tabs grow
                  variant={"unstyled"}
                  styles={(theme) => tabStyles(theme, theme.colors.red[8])}>
                <Tabs.Tab label={isMobile ? "" : "Tracking"}
                          icon={<Eye size={18}/>}>
                    <ShowTrackingStatusTabs />
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}

//endregion
