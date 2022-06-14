import { LoaderFunction } from "@remix-run/node";
import React from "react";
import { Container, MantineTheme, Tabs, Title } from "@mantine/core";
import { Check, Clock, Eye, PlayerPause, PlayerPlay } from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import { useMobileQuery } from "~/utils/hooks";
import tabStyles from "~/styles/tabStyles";
import { ShowTrackingStatusTable } from "~/components/home/shows/ShowTrackingStatusTable";
import {
    ShowTrackingStatus
} from "backend";

//region Server

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request);

    return null;
}

//endregion

//region Client

function showsTabStyles(theme: MantineTheme) {
    return tabStyles(theme, theme.colors.red[8]);
}

function ShowsTrackingTab() {
    const isMobile = useMobileQuery();

    return (
        <Tabs grow
              variant={"unstyled"}
              styles={showsTabStyles}>
            <Tabs.Tab label={isMobile ? "" : "Completed"}
                      icon={<Check size={18}/>}>
                <ShowTrackingStatusTable status={ShowTrackingStatus.Completed}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Watching"}
                      icon={<PlayerPlay size={18}/>}>
                <ShowTrackingStatusTable status={ShowTrackingStatus.Watching}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Paused"}
                      icon={<PlayerPause size={18}/>}>
                <ShowTrackingStatusTable status={ShowTrackingStatus.Paused}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Planning"}
                      icon={<Clock size={18}/>}>
                <ShowTrackingStatusTable status={ShowTrackingStatus.Planning}/>
            </Tabs.Tab>
        </Tabs>
    );
}

export default function Shows() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Shows</Title>

            <Tabs grow
                  variant={"unstyled"}
                  styles={showsTabStyles}>
                <Tabs.Tab label={isMobile ? "" : "Tracking"}
                          icon={<Eye size={18}/>}>
                    <ShowsTrackingTab/>
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}

//endregion
