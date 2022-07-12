import { Center, Container, Stack, Text, Title } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { backendAPIClientInstance, GetUserFollowingsActivitiesItemResult } from "backend";
import UserActivityCard from "~/components/home/members/UserActivityCard";
import Motion from "~/components/home/Motion";
import { useMobileQuery } from "~/utils/hooks";
import { requireUserId } from "~/utils/session.server";

//#region Server

interface LoaderData {
    timeline: GetUserFollowingsActivitiesItemResult[]
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    
    const timelineResponse = await backendAPIClientInstance.user_GetTimeline(userId);

    return json<LoaderData>({
        timeline: timelineResponse.result.items
    });
}

//#endregion

//#region Client

export default function Feed() {
    const loaderData = useLoaderData<LoaderData>();
    const isMobile = useMobileQuery();

    return (
        <Motion>
            <Container px={isMobile ? 4 : 16} py={16}>
                <Title mb={32} order={1}>Feed</Title>

                {(loaderData.timeline.length === 0) ?                 
                    <Center p={64}>
                        <Text align={"center"}>There are no recent activities.</Text>
                    </Center> :
                    <Stack>
                        {loaderData.timeline.map((activity) => (
                            <UserActivityCard 
                                key={`${activity.id}`} 
                                activity={activity} />
                        ))}
                    </Stack>
                }
            </Container>
        </Motion>
    );
}

//#endregion
