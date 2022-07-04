import { Center, Container, LoadingOverlay, Stack, Text, useMantineTheme } from "@mantine/core";
import { useEffect } from "react";
import { useUserActivities } from "~/routes/home/members/activity/$userId";
import { useMobileQuery } from "~/utils/hooks";
import UserActivityCard from "~/components/home/members/UserActivityCard";

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
                        <UserActivityCard activity={activity} />
                    ))}
            </Stack>
        </Container>
    );
}
