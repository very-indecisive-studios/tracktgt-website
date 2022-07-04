import { Card, Container, Group, Image, Stack, Text, Title } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { backendAPIClientInstance, GetTopUsersItemResult } from "backend";
import { useMobileQuery } from "~/utils/hooks";
import { requireUserId } from "~/utils/session.server";

//region Server

interface LoaderData {
    topMembers: GetTopUsersItemResult[];
}

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request);
    
    const topUsersResponse = await backendAPIClientInstance.user_GetTopUsers(3);

    return json<LoaderData>({
        topMembers: topUsersResponse.result.items
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
        <Link to={`/home/members/${userName}`} style={{ textDecoration: "none" }}>
            <Card sx={() => ({
                minWidth: "275px"
            })}>
                <Stack>
                    <Group align={"end"}>
                        <Image radius={50} height={50} width={50} src={profilePictureURL ?? "/default_user.svg"} />

                        <Title order={4}>{userName}</Title>
                    </Group>
                    
                    <Text size="sm">
                        {bio ?? <i>{userName} has not provided any description yet.</i>}
                    </Text>
                </Stack>
            </Card>
        </Link>
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
            <Group my={16} grow noWrap sx={() => ({
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
        </Container>
    );
}
//endregion
