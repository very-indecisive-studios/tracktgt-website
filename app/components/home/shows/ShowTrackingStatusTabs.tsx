import React from "react";
import { Tabs } from "@mantine/core";
import { Check, Clock, PlayerPause, PlayerPlay } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import { ShowTrackingStatusTable } from "~/components/home/shows/ShowTrackingStatusTable";
import { ShowTrackingStatus } from "backend";
import { mediaTabStyles } from "~/styles/tabStyles";

interface ShowTrackingStatusTabProps {
    userId: string;
    readOnly: boolean;
}

export default function ShowTrackingStatusTab({ userId, readOnly }: ShowTrackingStatusTabProps) {
    const isMobile = useMobileQuery();

    return (
        <Tabs grow
              variant={"unstyled"}
              styles={theme => mediaTabStyles(theme, theme.colors.red[8])}>
            <Tabs.Tab label={isMobile ? "" : "Watching"}
                      icon={<PlayerPlay size={18}/>}>
                <ShowTrackingStatusTable readOnly={readOnly} userId={userId} status={ShowTrackingStatus.Watching}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Paused"}
                      icon={<PlayerPause size={18}/>}>
                <ShowTrackingStatusTable readOnly={readOnly} userId={userId} status={ShowTrackingStatus.Paused}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Planning"}
                      icon={<Clock size={18}/>}>
                <ShowTrackingStatusTable readOnly={readOnly} userId={userId} status={ShowTrackingStatus.Planning}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Completed"}
                      icon={<Check size={18}/>}>
                <ShowTrackingStatusTable readOnly={readOnly} userId={userId} status={ShowTrackingStatus.Completed}/>
            </Tabs.Tab>
        </Tabs>
    );
}
