import { Button, Container, Divider, Group, Image, Stack, Tabs, Text, Title } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { backendAPIClientInstance } from "backend";
import { notFound } from "remix-utils";
import { Book2, DeviceGamepad, DeviceTv, Eye, Star, UserMinus, UserPlus } from "tabler-icons-react";
import BooksTrackingTabs from "~/components/home/books/BookTrackingStatusTabs";
import BookWishlistTable from "~/components/home/books/BookWishlistTable";
import GameTrackingTabs from "~/components/home/games/GameTrackingStatusTabs";
import GameWishlistTable from "~/components/home/games/GameWishlistTable";
import ShowTrackingStatusTabs from "~/components/home/shows/ShowTrackingStatusTabs";
import { trackingMediaTabStyles, wishlistMediaTabStyles } from "~/styles/tabStyles";
import { useMobileQuery } from "~/utils/hooks";
import { requireUserId } from "~/utils/session.server";
import { useUserFollow } from "~/routes/home/members/follow/$targetUserId";
import { useEffect } from "react";
import { showNotification } from "@mantine/notifications";

//region Server

interface LoaderData {
    isSelf: boolean;
    userId: string;
    profilePictureURL: string;
    userName: string;
    bio: string;
    gamingHours: number;
    episodesWatched: number;
    chaptersRead: number;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const userId = await requireUserId(request);
    
    try {
        const getUserByUserNameResponse = await backendAPIClientInstance.user_GetUserByUserName(params.username ?? "");
        const { profilePictureURL, remoteId, userName, bio } = getUserByUserNameResponse.result;
        
        const getUserStatsResponse = await backendAPIClientInstance.user_GetUserStats(remoteId);
        const { gamingHours, episodesWatched, chaptersRead } = getUserStatsResponse.result;

        return json<LoaderData>({
            isSelf: userId === remoteId,
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
    const { isFollowing, followUser, unfollowUser, isLoading, actionDone: followActionDone } = useUserFollow(loaderData.userId);

    useEffect(() => {
        if (followActionDone == "add") {
            showNotification({
                title: 'Successfully followed user.',
                message: `You are now following ${loaderData.userName}.`,
                icon: <UserPlus size={16}/>,
                color: "green"
            });
        } else if (followActionDone == "remove") {
            showNotification({
                title: 'Successfully unfollowed user.',
                message: `You are no longer following ${loaderData.userName}.`,
                icon: <UserMinus size={16}/>,
                color: "red"
            });
        }
    }, [followActionDone])

    return (
        <Container py={16}>
            <Group mb={32}>
                <Image radius={200} height={200} width={200} src={loaderData.profilePictureURL ?? "/default_user.svg"} />

                <Stack ml={32} sx={() => ({
                    flex: 1
                })}>
                    <Group grow>
                        <Group position="left">
                            <Title>{loaderData.userName}</Title>
                        </Group>
                        {!loaderData.isSelf &&                        
                            <Group position="right">
                                {!isFollowing ? 
                                    <Button loading={isLoading} 
                                        leftIcon={<UserPlus size={20} />} 
                                        onClick={() => followUser()}>
                                        Follow
                                    </Button> :
                                    <Button loading={isLoading} 
                                        leftIcon={<UserMinus size={20} />} onClick={() => unfollowUser()}
                                        color={"red"}
                                        variant={"outline"}>
                                        Unfollow
                                    </Button>
                                }
                            </Group>
                        }
                    </Group>
                    
                    <Text>{loaderData.bio ?? <i>{loaderData.userName} has not provided any description yet.</i>}</Text>
                    
                    
                    <Group spacing={"xl"} position="center">
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
