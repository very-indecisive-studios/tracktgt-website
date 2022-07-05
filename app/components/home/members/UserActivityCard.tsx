import { Card, Grid, Group, Image, Stack, Text, Title } from "@mantine/core";
import { Link } from "@remix-run/react";
import { ActivityAction, ActivityMediaType } from "backend";
import dayjs, { Dayjs } from "dayjs";
import CoverImage from "~/components/home/CoverImage";
import { useMobileQuery } from "~/utils/hooks";

interface Activity {
    userName: string;
    profilePictureURL: string;
    mediaTitle: string;
    mediaRemoteId: string;
    mediaCoverImageURL: string;
    mediaType: ActivityMediaType;
    status: string;
    action: ActivityAction;
    noOf: number;
    dateTime: Dayjs;
}

interface UserActivityCardProps {
    activity: Activity;
}

function humanizeActivity(activity: Activity): string {
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
            return `Added ${activity.mediaTitle} with ${activity.noOf} ${noOfUnit} in ${activity.status}.`;
        case ActivityAction.Update:
            return `Updated ${activity.mediaTitle} with ${activity.noOf} ${noOfUnit} in ${activity.status}.`;
        case ActivityAction.Remove:
            return `Removed ${activity.mediaTitle} from ${activity.status}.`;
    }
}

function humanizeDateTime(dateTimeString: string): string {
    const dateTime = dayjs(dateTimeString);
    const today = dayjs();
    
    const diffDays = today.diff(dateTime, "days");
    if (diffDays >= 1) {
        return `${diffDays} days ago`;
    }
    
    const diffHours = today.diff(dateTime, "hours");
    if (diffHours >= 1) {
        return `${diffHours} hours ago`;
    }
    
    const diffMinutes = today.diff(dateTime, "minutes");
    return `${diffMinutes} minutes ago`;
}

export default function UserActivityCard({ activity }: UserActivityCardProps) {
    const isMobile = useMobileQuery();

    return (
        <Card shadow="xs" p="lg">
            <Grid>
                <Grid.Col span={isMobile ? 10 : 11}>
                    <Stack>
                        <Group align={"start"}>
                            <Image radius={50} height={50} width={50} src={activity.profilePictureURL ?? "/default_user.svg"} />
                            
                            <Stack spacing={0}>
                                <Link to={`/home/members/${activity.userName}`} style={{ textDecoration: "none" }}>
                                    <Title order={5} sx={(theme) => ({
                                        color: theme.colors.gray[5]
                                    })}>{activity.userName}</Title>
                                </Link>
                                <Text size={"sm"} sx={(theme) => ({
                                    color: theme.colors.gray[6]
                                })}>
                                    {humanizeDateTime(activity.dateTime.toString())}
                                </Text>
                            </Stack>
                        </Group>
                        
                        <Text py={4} sx={(theme) => ({
                            color: theme.colors.gray[5]
                        })}>
                            {humanizeActivity(activity)}
                        </Text>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={isMobile ? 2 : 1}>                    
                    <Link to={`/home/${ActivityMediaType[activity.mediaType].toLowerCase()}s/${activity.mediaRemoteId}`}>
                        <CoverImage src={activity.mediaCoverImageURL} width={60} height={90}/>
                    </Link>
                </Grid.Col>
            </Grid>
        </Card>
    );
}
