import { Card, Center, Container, Grid, Group, Image, LoadingOverlay, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { Link } from "@remix-run/react";
import { ActivityAction, ActivityMediaType, GetUserActivitiesItemResult } from "backend";
import { useEffect } from "react";
import { useUserActivities } from "~/routes/home/members/activity/$userId";
import { useMobileQuery } from "~/utils/hooks";
import CoverImage from "../CoverImage";

function humanizeActivity(activity: GetUserActivitiesItemResult): string {
    let noOfUnit = "";
    switch (activity.mediaType) {
        case ActivityMediaType.Game:
            noOfUnit = "hours played";
            break;
        case ActivityMediaType.Show:
            noOfUnit = "episodes watched";
            break;
        case ActivityMediaType.Book:
            noOfUnit = "chapters read";
            break;
    }

    switch (activity.action) {
        case ActivityAction.Add:
            return `${activity.userName} added ${activity.mediaTitle} with ${activity.noOf} ${noOfUnit} in ${activity.status}.`;
        case ActivityAction.Update:
            return `${activity.userName} updated ${activity.mediaTitle} with ${activity.noOf} ${noOfUnit} in ${activity.status}.`;
        case ActivityAction.Remove:
            return `${activity.userName} removed ${activity.mediaTitle} from ${activity.status}.`;
    }
}

interface UserActivityTimelineProps {
    userId: string;
    userName: string;
    userProfilePictureURL: string
}

export function UserActivityTimeline({ userId }: UserActivityTimelineProps) {
    const isMobile = useMobileQuery();

    const theme = useMantineTheme();
    
    const { activities, isLoading, setUserId: setUserActivitiesUserId } = useUserActivities(userId);

    useEffect(() => {
        setUserActivitiesUserId(userId);
    }, [userId]);

    return (
        <Container>
            <Stack py={16} sx={(theme) => ({
                overflowX: "auto",
                position: "relative",
                minHeight: "300px"
            })}>
                <LoadingOverlay overlayOpacity={1}
                                overlayColor={theme.colors.dark[8]}
                                visible={isLoading} />
                {(!isLoading && activities.length === 0) ?                 
                    <Center p={64}>
                        <Text align={"center"}>There are no recent activities.</Text>
                    </Center> :
                    activities.map((activity) => (
                        <Card shadow="xs" p="lg" key={`${activity.userName}-${activity.mediaRemoteId}-${activity.action}-${activity.noOf}`}>
                            <Grid align={"center"}>
                                <Grid.Col span={isMobile ? 0 : 1}>
                                    <Image radius={60} height={60} width={60} src={activity.profilePictureURL} />
                                </Grid.Col>      
                                <Grid.Col span={isMobile ? 9 : 10}>
                                    <Text px={8}>{humanizeActivity(activity)}</Text>
                                </Grid.Col>                      
                                <Grid.Col span={isMobile ? 3 : 1}>
                                    <Link to={`/home/${ActivityMediaType[activity.mediaType].toLowerCase()}s/${activity.mediaRemoteId}`}>
                                        <CoverImage src={activity.mediaCoverImageURL} width={60} height={90}/>
                                    </Link>
                                </Grid.Col>
                            </Grid>
                        </Card>
                    ))}
            </Stack>
        </Container>
    );
}
