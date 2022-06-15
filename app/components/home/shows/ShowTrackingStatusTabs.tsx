import React from "react";
import { Tabs } from "@mantine/core";
import { Check, Clock, PlayerPause, PlayerPlay } from "tabler-icons-react";
import tabStyles from "~/styles/tabStyles";
import { useMobileQuery } from "~/utils/hooks";
import { ShowTrackingStatusTable } from "~/components/home/shows/ShowTrackingStatusTable";
import { ShowTrackingStatus } from "backend";

export default function ShowTrackingStatusTab() {
    const isMobile = useMobileQuery();

    return (
        <Tabs grow
              variant={"unstyled"}
              styles={theme => tabStyles(theme, theme.colors.red[8])}>
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
