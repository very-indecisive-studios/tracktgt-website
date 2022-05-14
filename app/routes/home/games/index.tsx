import { Container, Table, Title, useMantineTheme } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import {
    backendAPIClientInstance,
    PagedListResultOfGetAllUserTrackedGamesItemResult, TrackedGameFormat,
    TrackedGameOwnership,
    TrackedGameStatus
} from "backend";
import { Link, useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    
    const getAllUserTrackedGamesBackendAPIResponse = await backendAPIClientInstance.game_GetAllUserTrackedGames(
        userId,
        null,
        false,
        false,
        false,
        false,
        1,
        10
    );
    
    return json(getAllUserTrackedGamesBackendAPIResponse.result);
}

export default function Games() {
    const data = useLoaderData<PagedListResultOfGetAllUserTrackedGamesItemResult>();
    const theme = useMantineTheme();

    const rows = data.items?.map((item) => (
        <tr key={item.gameRemoteId}>
            <td><Link style={{color: theme.colors.dark[1]}} to={`/home/games/${item.gameRemoteId}`}>{item.title}</Link></td>
            <td>{item.hoursPlayed}</td>
            <td>{TrackedGameFormat[item.format!!]}</td>
            <td>{TrackedGameStatus[item.status!!]}</td>
            <td>{TrackedGameOwnership[item.ownership!!]}</td>
        </tr>
    ));
    
    return (
        <Container py={16}>
            <Title mb={32} order={1}>Games</Title>

            <Table>
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Hours Played</th>
                    <th>Format</th>
                    <th>Status</th>
                    <th>Ownership</th>
                </tr>
                </thead>
                <tbody>{rows}</tbody>
            </Table>
        </Container>
    );
}