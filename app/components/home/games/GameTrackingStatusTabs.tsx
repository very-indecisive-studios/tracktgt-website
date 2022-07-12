import React from "react";
import { Tabs } from "@mantine/core";
import { Check, Clock, PlayerPause, PlayerPlay } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import GameTrackingStatusTable from "~/components/home/games/GameTrackingStatusTable";
import { GameTrackingStatus } from "backend";
import { mediaTabStyles } from "~/styles/tabStyles";

interface GameTrackingTabsProps {
    userId: string;
    readOnly: boolean;
}

export default function GameTrackingTabs({ userId, readOnly }: GameTrackingTabsProps) {
    const isMobile = useMobileQuery();

    return (
        <Tabs grow
              variant={"unstyled"}
              styles={(theme) => mediaTabStyles(theme, theme.colors.blue[8])}>
            <Tabs.Tab label={isMobile ? "" : "Playing"}
                      icon={<PlayerPlay size={18}/>}>
                <GameTrackingStatusTable readOnly={readOnly} userId={userId} status={GameTrackingStatus.Playing}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Paused"}
                      icon={<PlayerPause size={18}/>}>
                <GameTrackingStatusTable readOnly={readOnly} userId={userId} status={GameTrackingStatus.Paused}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Planning"}
                      icon={<Clock size={18}/>}>
                <GameTrackingStatusTable readOnly={readOnly} userId={userId} status={GameTrackingStatus.Planning}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Completed"}
                      icon={<Check size={18}/>}>
                <GameTrackingStatusTable readOnly={readOnly} userId={userId} status={GameTrackingStatus.Completed}/>
            </Tabs.Tab>
        </Tabs>
    );
}