import { LoaderFunction } from "@remix-run/node";
import React from "react";
import { Container, Tabs, Title } from "@mantine/core";
import { Eye, Star } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import { requireUserId } from "~/utils/session.server";
import tabStyles from "~/styles/tabStyles";
import BookWishlistTable from "~/components/home/books/BookWishlistTable";
import BooksTrackingTabs from "~/components/home/books/BookTrackingStatusTabs";

//region Server

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request);
    
    return null;
}

//endregion

//region Client

export default function Books() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Books</Title>

            <Tabs grow
                  variant={"unstyled"}
                  styles={(theme) => tabStyles(theme, theme.colors.yellow[8])}>
                <Tabs.Tab label={isMobile ? "" : "Tracking"}
                          icon={<Eye size={18}/>}>
                    <BooksTrackingTabs />
                </Tabs.Tab>

                <Tabs.Tab label={isMobile ? "" : "Wishlist"}
                          icon={<Star size={18}/>}>
                    <BookWishlistTable/>
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}

//endregion
