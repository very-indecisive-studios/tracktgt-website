import { json, LoaderFunction } from "@remix-run/node";
import React from "react";
import { Container, Tabs, Title } from "@mantine/core";
import { Eye, Star } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import { requireUserId } from "~/utils/session.server";
import { mediaTabStyles } from "~/styles/tabStyles";
import BookWishlistTable from "~/components/home/books/BookWishlistTable";
import BooksTrackingTabs from "~/components/home/books/BookTrackingStatusTabs";
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

export default function Books() {
    const loaderData = useLoaderData<LoaderData>();
    const isMobile = useMobileQuery();

    return (
        <Motion>
            <Container py={16} px={isMobile ? 4 : 16}>
                <Title mb={32} order={1}>Books</Title>

                <Tabs grow
                    variant={"unstyled"}
                    styles={(theme) => mediaTabStyles(theme, theme.colors.yellow[8])}>
                    <Tabs.Tab label={isMobile ? "" : "Tracking"}
                            icon={<Eye size={18}/>}>
                        <BooksTrackingTabs readOnly={false} userId={loaderData.userId} />
                    </Tabs.Tab>

                    <Tabs.Tab label={isMobile ? "" : "Wishlist"}
                            icon={<Star size={18}/>}>
                        <BookWishlistTable readOnly={false} userId={loaderData.userId} />
                    </Tabs.Tab>
                </Tabs>
            </Container>
        </Motion>
    );
}

//endregion
