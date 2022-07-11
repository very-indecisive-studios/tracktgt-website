import { ActionIcon, Button, Container, Divider, Group, Image, MediaQuery, Stack, Tabs, Text, Title } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { backendAPIClientInstance, GetUserActivitiesItemResult } from "backend";
import { notFound } from "remix-utils";
import { Activity, Book2, DeviceGamepad, DeviceTv, Eye, Pencil, Star, UserMinus, UserPlus } from "tabler-icons-react";
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
import { useUserFollowersList } from "./followers/$userId";
import { useUserFollowingsList } from "./followings/$userId";
import { showUserFollowListModal } from "~/components/home/members/UserFollowListModal";
import { useModals } from "@mantine/modals";
import UserActivityCard from "~/components/home/members/UserActivityCard";

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
    activities: GetUserActivitiesItemResult[];
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const userId = await requireUserId(request);
    
    try {
        const getUserByUserNameResponse = await backendAPIClientInstance.user_GetUserByUserName(params.username ?? "");
        const { profilePictureURL, remoteId, userName, bio } = getUserByUserNameResponse.result;
        
        const getUserStatsResponse = await backendAPIClientInstance.user_GetUserStats(remoteId);
        const { gamingHours, episodesWatched, chaptersRead } = getUserStatsResponse.result;

        const getUserActivitiesResponse = await backendAPIClientInstance.user_GetUserActivities(remoteId);
        const { items } = getUserActivitiesResponse.result;

        return json<LoaderData>({
            isSelf: userId === remoteId,
            userId: remoteId,
            profilePictureURL,
            userName,
            bio,
            gamingHours,
            episodesWatched,
            chaptersRead,
            activities: items
        });
    } catch {
        throw notFound(null);
    }
}

//endregion

//region Client

interface UserActivityTimelineProps {
    activities: GetUserActivitiesItemResult[];
}

export function UserActivityTimeline({ activities }: UserActivityTimelineProps) {
    return (
        <Container>
            <Stack>
                {activities.map((activity) => (
                    <UserActivityCard 
                        key={`${activity.id}`} 
                        activity={activity} />
                ))}
            </Stack>
        </Container>
    );
}

export default function UserProfile() {
    const loaderData = useLoaderData<LoaderData>();
    const isMobile = useMobileQuery();
    const modals = useModals();

    const { isFollowing, followUser, unfollowUser, isLoading: isUserFollowLoading, 
        actionDone: followActionDone, setUserId: setUserFollowUserId } = useUserFollow(loaderData.userId);
    const { followers, refresh: refreshFollowers, setUserId: setUserFollowersListUserId  } 
        = useUserFollowersList(loaderData.userId);
    const { followings, setUserId: setUserFollowingsListUserId } 
        = useUserFollowingsList(loaderData.userId);

    useEffect(() => {
        if (followActionDone == "add") {
            showNotification({
                title: 'Successfully followed user.',
                message: `You are now following ${loaderData.userName}.`,
                icon: <UserPlus size={16}/>,
                color: "green"
            });

            refreshFollowers();
        } else if (followActionDone == "remove") {
            showNotification({
                title: 'Successfully unfollowed user.',
                message: `You are no longer following ${loaderData.userName}.`,
                icon: <UserMinus size={16}/>,
                color: "red"
            });

            refreshFollowers();
        }
    }, [followActionDone])

    useEffect(() => {
        setUserFollowUserId(loaderData.userId);
        setUserFollowersListUserId(loaderData.userId);
        setUserFollowingsListUserId(loaderData.userId);
    }, [loaderData.userId]);

    return (
        <Container py={16}>
            <Group mb={32}>
                <Image radius={isMobile ? 100 : 200} height={isMobile ? 100 : 200} width={isMobile ? 100 : 200} src={loaderData.profilePictureURL ?? "/default_user.svg"} />

                <Stack ml={isMobile ? 8 : 32} sx={() => ({
                    flex: 1
                })}>
                    <Group grow>
                        <Group position="left">
                            <Title order={isMobile ? 3 : 1}>{loaderData.userName}</Title>
                            {loaderData.isSelf && 
                                <ActionIcon component={Link} to={"/home/settings"}> 
                                    <Pencil size={20} />
                                </ActionIcon>
                            }
                        </Group>
                        {!loaderData.isSelf &&                        
                            <Group position="right">
                                {!isFollowing ? 
                                    <Button size={isMobile ? "xs" : "sm"} 
                                        loading={isUserFollowLoading} 
                                        leftIcon={<UserPlus size={20} />} 
                                        onClick={() => followUser()}>
                                        Follow
                                    </Button> :
                                    <Button size={isMobile ? "xs" : "sm"} 
                                        loading={isUserFollowLoading} 
                                        leftIcon={<UserMinus size={20} />} 
                                        color={"red"}
                                        variant={"outline"}
                                        onClick={() => unfollowUser()}>
                                        Unfollow
                                    </Button>
                                }
                            </Group>
                        }
                    </Group>
                    
                    <Group spacing={"xs"}>
                        <Button variant="light" onClick={() => showUserFollowListModal(modals, followers, "Followers")}>
                            <Group spacing={"xs"}>
                                <Text size={isMobile ? "sm" : "md"}><b>{followers.length}</b></Text>
                                <Text size={isMobile ? "sm" : "md"}>followers</Text>
                            </Group>
                        </Button>

                        <Button variant="light" onClick={() => showUserFollowListModal(modals, followings, "Followings")}>
                            <Group spacing={"xs"}>
                                <Text size={isMobile ? "sm" : "md"}><b>{followings.length}</b></Text>
                                <Text size={isMobile ? "sm" : "md"}>followings</Text>
                            </Group>
                        </Button>
                    </Group>

                    <Text size={isMobile ? "sm" : "md"}>
                        {loaderData.bio ?? <i>{loaderData.userName} has not provided any description yet.</i>}
                    </Text>
                </Stack>
            </Group>

            <Stack my={isMobile ? 32 : 48}>
                <Divider />

                <MediaQuery smallerThan={"sm"} styles={{
                    display: "none"
                }}>
                    <Group spacing={"xl"} position="center">
                        <Group spacing={"xs"}>
                            <Text size={"xl"}><b>{loaderData.gamingHours}</b></Text>
                            <Text size={"md"}>gaming hours</Text>
                        </Group>
                        <Divider sx={{ height: '32px' }} size="sm" orientation={"vertical"} />
                        <Group spacing={"xs"}>
                            <Text size={"xl"}><b>{loaderData.episodesWatched}</b></Text>
                            <Text size={"md"}>episodes watched</Text>
                        </Group>
                        <Divider sx={{ height: '32px' }} size="sm" orientation={"vertical"} />
                        <Group spacing={"xs"}>
                            <Text size={"xl"}><b>{loaderData.chaptersRead}</b></Text>
                            <Text size={"md"}>chapters read</Text>
                        </Group>
                    </Group>
                </MediaQuery>

                
                <MediaQuery largerThan={"sm"} styles={{
                    display: "none"
                }}>
                    <Stack spacing={"xs"} align="center">
                        <Group spacing={"xs"}>
                            <Text size={"sm"}><b>{loaderData.gamingHours}</b></Text>
                            <Text size={"sm"}>gaming hours</Text>
                        </Group>
                        <Group spacing={"xs"}>
                            <Text size={"sm"}><b>{loaderData.episodesWatched}</b></Text>
                            <Text size={"sm"}>episodes watched</Text>
                        </Group>
                        <Group spacing={"xs"}>
                            <Text size={"sm"}><b>{loaderData.chaptersRead}</b></Text>
                            <Text size={"sm"}>chapters read</Text>
                        </Group>
                    </Stack>
                </MediaQuery>    

                <Divider />
            </Stack>
            
            <Tabs grow mb={16} tabPadding={32}>
                <Tabs.Tab label={isMobile ? "" : "Activities"}
                          icon={<Activity size={18}/>}>
                    <UserActivityTimeline activities={loaderData.activities} />
                </Tabs.Tab>

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
