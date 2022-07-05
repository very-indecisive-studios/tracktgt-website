import { Card, Center, Container, Group, Image, Stack, Text, Title } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { backendAPIClientInstance, GetGlobalActivitiesItemResult, GetTopUsersItemResult } from "backend";
import UserActivityCard from "~/components/home/members/UserActivityCard";
import { useMobileQuery } from "~/utils/hooks";
import { requireUserId } from "~/utils/session.server";

//region Server

interface LoaderData {
    topMembers: GetTopUsersItemResult[];
    globalActivities: GetGlobalActivitiesItemResult[];
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    
    const topUsersResponse = await backendAPIClientInstance.user_GetTopUsers(5);

    const globalActivitiesResponse = await backendAPIClientInstance.user_GetGlobalActivities();

    return json<LoaderData>({
        topMembers: topUsersResponse.result.items,
        globalActivities: globalActivitiesResponse.result.items
    });
}

//endregion

//region Client

interface TopMembersCardProps {
    remoteId: string;
    profilePictureURL: string;
    userName: string;
    bio: string;
    followersCount: number;
}

function TopMembersCard({ remoteId, profilePictureURL, userName, bio, followersCount }: TopMembersCardProps) {
    return (
        <Card sx={() => ({
            minWidth: "325px"
        })}>
            <Stack>
                <Group align={"center"}>
                    <Image radius={50} height={50} width={50} src={profilePictureURL ?? "/default_user.svg"} />

                    <Stack spacing={0}>
                        <Link to={`/home/members/${userName}`} style={{ textDecoration: "none" }}>
                            <Title order={4} sx={(theme) => ({
                                color: theme.colors.gray[5]
                            })}>{userName}</Title>
                        </Link>
                        <Group spacing={"xs"} sx={(theme) => ({
                            color: theme.colors.gray[6]
                        })}>
                            <Text size="sm">{followersCount} followers</Text>
                        </Group>
                    </Stack>
                </Group>
                
                <Text 
                    size="sm" 
                    sx={(theme) => ({
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    })}>
                    {bio ?? <i>{userName} has not provided any description yet.</i>}
                </Text>
            </Stack>
        </Card>
    );
}

export default function Games() {
    const loaderData = useLoaderData<LoaderData>();

    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Members</Title>

            <Title order={2} sx={(theme) => ({
                color: theme.colors.gray[6]
            })}>
                Top members
            </Title>
            <Group align={"start"} py={32} grow noWrap sx={() => ({
                overflowX: "auto"
            })}>
                {loaderData.topMembers.map(m => (
                    <TopMembersCard 
                        key={m.remoteId}
                        remoteId={m.remoteId} 
                        bio={m.bio} 
                        followersCount={m.followersCount}
                        userName={m.userName}
                        profilePictureURL={m.profilePictureURL} />
                ))}
            </Group>

            <Title mt={16} order={2} sx={(theme) => ({
                color: theme.colors.gray[6]
            })}>
                Global activities
            </Title>
            <Stack py={32}>
                {(loaderData.globalActivities.length === 0) ?                 
                    <Center p={64}>
                        <Text align={"center"}>There are no recent activities.</Text>
                    </Center> :
                    loaderData.globalActivities.map((activity) => (
                        <UserActivityCard 
                            key={`${activity.userName}-${activity.mediaRemoteId}-${activity.action}-${activity.noOf}`} 
                            activity={activity} />
                    ))}
            </Stack>
        </Container>
    );
}
//endregion
