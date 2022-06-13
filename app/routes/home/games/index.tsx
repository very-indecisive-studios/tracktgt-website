import React from "react";
import { Container, MantineTheme, Tabs, Title, } from "@mantine/core";
import { Check, Clock, Eye, PlayerPause, PlayerPlay, Star } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import tabStyles from "~/styles/tabStyles";
import GameWishlistTable from "~/components/home/games/GameWishlistTable";
import GameTrackingStatusTable from "~/components/home/games/GameTrackingStatusTable";
import {
    GameTrackingStatus,
} from "backend";

function gameTabStyles(theme: MantineTheme) {
    return tabStyles(theme, theme.colors.blue[8]);
}

function GameTrackingTabs() {
    const isMobile = useMobileQuery();

    return (
        <Tabs grow
              variant={"unstyled"}
              styles={gameTabStyles}>
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

export default function Games() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Games</Title>
            
            <Tabs grow
                  variant={"unstyled"}
                  styles={gameTabStyles}>
                <Tabs.Tab label={isMobile ? "" : "Tracking"}
                          icon={<Eye size={18}/>}>
                    <GameTrackingTabs />
                </Tabs.Tab>

                <Tabs.Tab label={isMobile ? "" : "Wishlist"}
                          icon={<Star size={18}/>}>
                    <GameWishlistTable />
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}
