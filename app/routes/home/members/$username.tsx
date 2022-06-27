import { Container, Divider, Group, Image, Stack, Tabs, Text, Title } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { backendAPIClientInstance } from "backend";
import { notFound } from "remix-utils";
import { Book2, DeviceGamepad, DeviceTv, Eye, Star } from "tabler-icons-react";
import BooksTrackingTabs from "~/components/home/books/BookTrackingStatusTabs";
import BookWishlistTable from "~/components/home/books/BookWishlistTable";
import GameTrackingTabs from "~/components/home/games/GameTrackingStatusTabs";
import GameWishlistTable from "~/components/home/games/GameWishlistTable";
import ShowTrackingStatusTabs from "~/components/home/shows/ShowTrackingStatusTabs";
import { trackingMediaTabStyles, wishlistMediaTabStyles } from "~/styles/tabStyles";
import { useMobileQuery } from "~/utils/hooks";
import { requireUserId } from "~/utils/session.server";

//region Server

interface LoaderData {
    userId: string;
    profilePictureURL: string;
    userName: string;
    bio: string;
    gamingHours: number;
    episodesWatched: number;
    chaptersRead: number;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);
    
    try {
        const getUserByUserNameResponse = await backendAPIClientInstance.user_GetUserByUserName(params.username ?? "");
        const { profilePictureURL, remoteId, userName, bio } = getUserByUserNameResponse.result;
        
        const getUserStatsResponse = await backendAPIClientInstance.user_GetUserStats(remoteId);
        const { gamingHours, episodesWatched, chaptersRead } = getUserStatsResponse.result;

        return json<LoaderData>({
            userId: remoteId,
            profilePictureURL,
            userName,
            bio,
            gamingHours,
            episodesWatched,
            chaptersRead
        });
    } catch {
        throw notFound(null);
    }
}

//endregion

//region Client

export default function UserProfile() {
    const loaderData = useLoaderData<LoaderData>();
    const isMobile = useMobileQuery();

    return (
        <Container py={16}>
            <Group mb={32}>
                <Image radius={200} height={200} width={200} src={loaderData.profilePictureURL ?? "/default_user.svg"} />

                <Stack ml={32} sx={() => ({
                    flex: 1
                })}>
                    <Title>{loaderData.userName}</Title>
                    <Text>{loaderData.bio ?? <i>{loaderData.userName} has not provided any description yet.</i>}</Text>
                    <Group spacing={"xl"}>
                        <Group>
                            <Text size="xl"><b>{loaderData.gamingHours}</b></Text>
                            <Text size="md">gaming hours</Text>
                        </Group>
                        <Divider sx={{ height: '32px' }} size="sm" orientation={"vertical"} />
                        <Group>
                            <Text size="xl"><b>{loaderData.episodesWatched}</b></Text>
                            <Text size="md">episodes watched</Text>
                        </Group>
                        <Divider sx={{ height: '32px' }} size="sm" orientation={"vertical"} />
                        <Group>
                            <Text size="xl"><b>{loaderData.chaptersRead}</b></Text>
                            <Text size="md">chapters read</Text>
                        </Group>
                    </Group>
                </Stack>
            </Group>
            
            <Tabs grow mb={16} variant={"outline"} tabPadding={32}>
                <Tabs.Tab label={isMobile ? "" : "Trackings"}
                          icon={<Eye size={18}/>}>
                    <Tabs grow
                        variant={"unstyled"}
                        styles={(theme) => trackingMediaTabStyles(theme)}>
                        <Tabs.Tab label={isMobile ? "" : "Games"}
                                icon={<DeviceGamepad size={18}/>}>
                            <GameTrackingTabs readOnly={true} userId={loaderData.userId} />
                        </Tabs.Tab>
                        <Tabs.Tab label={isMobile ? "" : "Shows"}
                                icon={<DeviceTv size={18}/>}>
                            <ShowTrackingStatusTabs readOnly={true} userId={loaderData.userId}  />
                        </Tabs.Tab>
                        <Tabs.Tab label={isMobile ? "" : "Books"}
                                icon={<Book2 size={18}/>}>
                            <BooksTrackingTabs readOnly={true} userId={loaderData.userId} />
                        </Tabs.Tab>
                    </Tabs>
                </Tabs.Tab>
                
                <Tabs.Tab label={isMobile ? "" : "Wishlists"}
                          icon={<Star size={18}/>}>
                    <Tabs grow
                        variant={"unstyled"}
                        styles={(theme) => wishlistMediaTabStyles(theme)}>
                        <Tabs.Tab label={isMobile ? "" : "Games"}
                                icon={<DeviceGamepad size={18}/>}>
                            <GameWishlistTable readOnly={true} userId={loaderData.userId} />
                        </Tabs.Tab>
                        <Tabs.Tab label={isMobile ? "" : "Books"}
                                icon={<Book2 size={18}/>}>
                            <BookWishlistTable readOnly={true} userId={loaderData.userId} />
                        </Tabs.Tab>
                    </Tabs>
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}

//endregion