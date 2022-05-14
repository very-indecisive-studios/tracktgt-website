import { Container, Table, Title, useMantineTheme } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import {
    backendAPIClientInstance,
    PagedListResultOfGetAllGameTrackingsItemResult, 
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus
} from "backend";
import { Link, useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    
    const getAllUserTrackedGamesBackendAPIResponse = await backendAPIClientInstance.game_GetAllGameTrackings(
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
    const data = useLoaderData<PagedListResultOfGetAllGameTrackingsItemResult>();
    const theme = useMantineTheme();

    const rows = data.items?.map((item) => (
        <tr key={item.gameRemoteId}>
            <td><Link style={{color: theme.colors.dark[1]}} to={`/home/games/${item.gameRemoteId}`}>{item.title}</Link></td>
            <td>{item.hoursPlayed}</td>
            <td>{item.platform}</td>
            <td>{GameTrackingFormat[item.format!!]}</td>
            <td>{GameTrackingStatus[item.status!!]}</td>
            <td>{GameTrackingOwnership[item.ownership!!]}</td>
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
                    <th>Platform</th>
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