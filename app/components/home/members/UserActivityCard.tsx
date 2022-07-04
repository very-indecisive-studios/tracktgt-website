import { Card, Grid, Image, Text } from "@mantine/core";
import { Link } from "@remix-run/react";
import { ActivityAction, ActivityMediaType } from "backend";
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
            return `${activity.userName} added ${activity.mediaTitle} with ${activity.noOf} ${noOfUnit} in ${activity.status}.`;
        case ActivityAction.Update:
            return `${activity.userName} updated ${activity.mediaTitle} with ${activity.noOf} ${noOfUnit} in ${activity.status}.`;
        case ActivityAction.Remove:
            return `${activity.userName} removed ${activity.mediaTitle} from ${activity.status}.`;
    }
}

export default function UserActivityCard({ activity }: UserActivityCardProps) {
    const isMobile = useMobileQuery();

    return (
        <Card shadow="xs" p="md" key={`${activity.userName}-${activity.mediaRemoteId}-${activity.action}-${activity.noOf}`}>
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
    );
}