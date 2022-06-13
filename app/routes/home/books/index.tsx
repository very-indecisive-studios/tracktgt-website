import { Container, MantineTheme, Tabs, Title } from "@mantine/core";
import React from "react";
import { Check, Clock, Eye, PlayerPause, PlayerPlay, Star } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import tabStyles from "~/styles/tabStyles";
import BookWishlistTable from "~/components/home/books/BookWishlistTable";
import BookTrackingStatusTable from "~/components/home/books/BookTrackingStatusTable";
import {
    BookTrackingStatus,
} from "backend";

function bookTabStyles(theme: MantineTheme) {
    return tabStyles(theme, theme.colors.yellow[8]);
}

function BooksTrackingTabs() {
    const isMobile = useMobileQuery();

    return (
        <Tabs grow
              variant={"unstyled"}
              styles={bookTabStyles}>
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

export default function Books() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Books</Title>

            <Tabs grow
                  variant={"unstyled"}
                  styles={bookTabStyles}>
                <Tabs.Tab label={isMobile ? "" : "Tracking"}
                          icon={<Eye size={18}/>}>
                    <BooksTrackingTabs/>
                </Tabs.Tab>

                <Tabs.Tab label={isMobile ? "" : "Wishlist"}
                          icon={<Star size={18}/>}>
                    <BookWishlistTable/>
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}
