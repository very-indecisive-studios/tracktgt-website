import React from "react";
import { Tabs } from "@mantine/core";
import { Check, Clock, PlayerPause, PlayerPlay } from "tabler-icons-react";
import tabStyles from "~/styles/tabStyles";
import { useMobileQuery } from "~/utils/hooks";
import GameTrackingStatusTable from "~/components/home/games/GameTrackingStatusTable";
import { GameTrackingStatus } from "backend";

export default function GameTrackingTabs() {
    const isMobile = useMobileQuery();

    return (
        <Tabs grow
              variant={"unstyled"}
              styles={(theme) => tabStyles(theme, theme.colors.blue[8])}>
            <Tabs.Tab label={isMobile ? "" : "Completed"}
                      icon={<Check size={18}/>}>
                <GameTrackingStatusTable status={GameTrackingStatus.Completed}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Playing"}
                      icon={<PlayerPlay size={18}/>}>
                <GameTrackingStatusTable status={GameTrackingStatus.Playing}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Paused"}
                      icon={<PlayerPause size={18}/>}>
                <GameTrackingStatusTable status={GameTrackingStatus.Paused}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Planning"}
                      icon={<Clock size={18}/>}>
                <GameTrackingStatusTable status={GameTrackingStatus.Planning}/>
            </Tabs.Tab>
        </Tabs>
    );
}