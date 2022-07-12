import React from "react";
import { json, LoaderFunction } from "@remix-run/node";
import { Container, Tabs, Title, } from "@mantine/core";
import { Eye, Star } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import { mediaTabStyles } from "~/styles/tabStyles";
import GameWishlistTable from "~/components/home/games/GameWishlistTable";
import GameTrackingTabs from "~/components/home/games/GameTrackingStatusTabs";
import { requireUserId } from "~/utils/session.server";
import { useLoaderData } from "@remix-run/react";
import Motion from "~/components/home/Motion";

//region Server

interface LoaderData {
    userId: string;
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    
    return json<LoaderData>({
        userId
    });
}

//endregion

//region Client

export default function Games() {
    const loaderData = useLoaderData<LoaderData>();
    const isMobile = useMobileQuery();

    return (
        <Motion>
            <Container py={16} px={isMobile ? 4 : 16}>
                <Title mb={32} order={1}>Games</Title>
                
                <Tabs grow
                    variant={"unstyled"}
                    styles={(theme) => mediaTabStyles(theme, theme.colors.blue[8])}>
                    <Tabs.Tab label={isMobile ? "" : "Tracking"}
                            icon={<Eye size={18}/>}>
                        <GameTrackingTabs readOnly={false} userId={loaderData.userId} />
                    </Tabs.Tab>

                    <Tabs.Tab label={isMobile ? "" : "Wishlist"}
                            icon={<Star size={18}/>}>
                        <GameWishlistTable readOnly={false} userId={loaderData.userId} />
                    </Tabs.Tab>
                </Tabs>
            </Container>
        </Motion>
    );
}

//endregion
