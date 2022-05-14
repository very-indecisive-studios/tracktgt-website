import { Box, Center, Container, Group, Stack, Table, Text, Title, useMantineTheme } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import {
    backendAPIClientInstance,
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus,
    GetAllGameTrackingsItemResult,
    PagedListResultOfGetAllGameTrackingsItemResult
} from "backend";
import { Link, useLoaderData } from "@remix-run/react";
import CoverImage from "~/components/CoverImage";
import { MoodConfuzed } from "tabler-icons-react";

interface LoaderData {
    playing: GetAllGameTrackingsItemResult[],
    paused: GetAllGameTrackingsItemResult[],
    planning: GetAllGameTrackingsItemResult[],
    completed: GetAllGameTrackingsItemResult[],
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    
    const getPlayingGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetAllGameTrackings(
        userId,
        GameTrackingStatus.Playing,
        true,
        false,
        false,
        false,
        false,
        1,
        5
    );    
    
    const getPausedGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetAllGameTrackings(
        userId,
        GameTrackingStatus.Paused,
        true,
        false,
        false,
        false,
        false,
        1,
        5
    );

    const getPlanningGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetAllGameTrackings(
        userId,
        GameTrackingStatus.Planning,
        true,
        false,
        false,
        false,
        false,
        1,
        5
    );

    const getCompletedGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetAllGameTrackings(
        userId,
        GameTrackingStatus.Completed,
        true,
        false,
        false,
        false,
        false,
        1,
        5
    );
    
    return json({
        playing: getPlayingGameTrackingsBackendAPIResponse.result.items,
        paused: getPausedGameTrackingsBackendAPIResponse.result.items,
        planning: getPlanningGameTrackingsBackendAPIResponse.result.items,
        completed: getCompletedGameTrackingsBackendAPIResponse.result.items,
    });
}

interface GameTrackingStatusTableProps {
    status: string;
    gameTrackings: GetAllGameTrackingsItemResult[];
}

const GameTrackingStatusTable = ({ status, gameTrackings }: GameTrackingStatusTableProps) => {
    const theme = useMantineTheme();

    const rows = gameTrackings.map((gt) => (
        <tr key={gt.gameRemoteId}>
            <td>
                <Link style={{color: theme.colors.dark[1], textDecoration: "none"}} to={`/home/games/${gt.gameRemoteId}`}>
                    <Group>
                        <CoverImage src={gt.coverImageURL} width={40} height={60}/>
                        <Text>{gt.title}</Text>
                    </Group>
                </Link>
            </td>
            <td>{gt.platform}</td>
            <td>{gt.hoursPlayed}</td>
            <td>{GameTrackingFormat[gt.format!!]}</td>
            <td>{GameTrackingStatus[gt.status!!]}</td>
            <td>{GameTrackingOwnership[gt.ownership!!]}</td>
        </tr>
    ));
    
    return (
        <Stack mb={64}>
            <Title order={2} sx={(theme) => ({
                color: theme.colors.gray[6]
            })}>{status}</Title>

            {rows.length == 0 &&
                <Center my={8}>
                    <Stack align={"center"}>
                        <MoodConfuzed size={64} color={theme.colors.gray[8]}/>
                        <Text sx={(theme) => ({
                            color: theme.colors.gray[6]
                        })}>
                            Looks like you don't have any {status.toLowerCase()} games.
                        </Text>
                    </Stack>
                </Center>}
            
            {rows.length != 0 &&
                <Table striped highlightOnHover verticalSpacing={"md"} fontSize={"md"}>
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Platform</th>
                        <th>Hours Played</th>
                        <th>Format</th>
                        <th>Status</th>
                        <th>Ownership</th>
                    </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </Table>}
        </Stack>
    );
}

export default function Games() {
    const data = useLoaderData<LoaderData>();

    return (
        <Container py={16}>
            <Title mb={32} order={1}>Games</Title>
            
            <GameTrackingStatusTable status="Playing" gameTrackings={data.playing} />
            <GameTrackingStatusTable status="Paused" gameTrackings={data.paused} />
            <GameTrackingStatusTable status="Planning" gameTrackings={data.planning} />
            <GameTrackingStatusTable status="Completed" gameTrackings={data.completed} />
        </Container>
    );
}