import React from "react";
import { LoaderFunction } from "@remix-run/node";
import { Container, Tabs, Title, } from "@mantine/core";
import { Eye, Star } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import tabStyles from "~/styles/tabStyles";
import GameWishlistTable from "~/components/home/games/GameWishlistTable";
import GameTrackingTabs from "~/components/home/games/GameTrackingStatusTabs";
import { requireUserId } from "~/utils/session.server";

//region Server

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request);
    
    return null;
}

//endregion

//region Client

export default function Games() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Games</Title>
            
            <Tabs grow
                  variant={"unstyled"}
                  styles={(theme) => tabStyles(theme, theme.colors.blue[8])}>
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

//endregion
