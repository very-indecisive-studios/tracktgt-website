import React from "react";
import { Tabs } from "@mantine/core";
import { Check, Clock, PlayerPause, PlayerPlay } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import tabStyles from "~/styles/tabStyles";
import BookTrackingStatusTable from "~/components/home/books/BookTrackingStatusTable";
import { BookTrackingStatus } from "backend";

export default function BooksTrackingTabs() {
    const isMobile = useMobileQuery();

    return (
        <Tabs grow
              variant={"unstyled"}
              styles={(theme) => tabStyles(theme, theme.colors.yellow[8])}>
            <Tabs.Tab label={isMobile ? "" : "Completed"}
                      icon={<Check size={18}/>}>
                <BookTrackingStatusTable status={BookTrackingStatus.Completed}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Reading"}
                      icon={<PlayerPlay size={18}/>}>
                <BookTrackingStatusTable status={BookTrackingStatus.Reading}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Paused"}
                      icon={<PlayerPause size={18}/>}>
                <BookTrackingStatusTable status={BookTrackingStatus.Paused}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Planning"}
                      icon={<Clock size={18}/>}>
                <BookTrackingStatusTable status={BookTrackingStatus.Planning}/>
            </Tabs.Tab>
        </Tabs>
    );
}