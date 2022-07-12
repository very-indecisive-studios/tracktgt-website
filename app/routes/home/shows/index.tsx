import { json, LoaderFunction } from "@remix-run/node";
import React from "react";
import { Container, Tabs, Title } from "@mantine/core";
import { Eye } from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import { useMobileQuery } from "~/utils/hooks";
import { mediaTabStyles } from "~/styles/tabStyles";
import ShowTrackingStatusTabs from "~/components/home/shows/ShowTrackingStatusTabs";
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

export default function Shows() {
    const loaderData = useLoaderData<LoaderData>();
    const isMobile = useMobileQuery();

    return (
        <Motion>
            <Container py={16} px={isMobile ? 4 : 16}>
                <Title mb={32} order={1}>Shows</Title>

                <Tabs grow
                    variant={"unstyled"}
                    styles={(theme) => mediaTabStyles(theme, theme.colors.red[8])}>
                    <Tabs.Tab label={isMobile ? "" : "Tracking"}
                            icon={<Eye size={18}/>}>
                        <ShowTrackingStatusTabs readOnly={false} userId={loaderData.userId} />
                    </Tabs.Tab>
                </Tabs>
            </Container>
        </Motion>
    );
}

//endregion
