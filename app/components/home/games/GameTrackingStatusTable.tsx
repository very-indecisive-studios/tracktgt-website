import { ActionIcon, Center, Group, LoadingOverlay, Pagination, Stack, Table, Text, useMantineTheme } from "@mantine/core";
import { useMobileQuery } from "~/utils/hooks";
import { useModals } from "@mantine/modals";
import React, { useEffect } from "react";
import {
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus,
} from "backend";
import { Link } from "@remix-run/react";
import CoverImage from "~/components/home/CoverImage";
import { Edit, Pencil, TrashX } from "tabler-icons-react";
import { useAllGamesTrackings } from "~/routes/home/games/track/all/$userId";
import { useGameTrackingsActions } from "~/routes/home/games/track/$gameId";
import { showGameTrackingEditorModal } from "~/components/home/games/GameTrackingModals";
import { showNotification } from "@mantine/notifications";
import PlatformIcon from "./PlatformIcon";

interface GameTrackingStatusTableProps {
    userId: string;
    status: GameTrackingStatus;
    readOnly: boolean;
}

export default function GameTrackingStatusTable({ userId, status, readOnly }: GameTrackingStatusTableProps) {
    const theme = useMantineTheme();
    const isMobile = useMobileQuery();
    const modals = useModals();

    const { allTrackings, currentPage, totalPages, fetchPage, isLoading: isFetcherLoading, setUserId: setAllGamesTrackingUserId } 
        = useAllGamesTrackings(userId, status);
    const { updateTracking, removeTracking, actionDone, isLoading: isActionLoading } = useGameTrackingsActions();
  
    useEffect(() => {
        setAllGamesTrackingUserId(userId);
    }, [userId])

    useEffect(() => {
        if (!isActionLoading) {
            fetchPage(currentPage);
        }
    }, [isActionLoading]);
    
    // Action notifications
    useEffect(() => {
        if (actionDone == "update") {
            showNotification({
                title: 'Successfully updated game tracking.',
                message: `Your changes have been saved.`,
                icon: <Pencil size={16}/>,
                color: "green"
            });
        } else if (actionDone == "remove") {
            showNotification({
                title: 'Successfully removed game tracking.',
                message: `Your changes have been saved.`,
                icon: <TrashX size={16}/>,
                color: "red"
            });
        }
    }, [actionDone]);
    
    return (
        <Stack py={16} sx={(theme) => ({
            overflowX: "auto",
            position: "relative",
            height: "600px"
        })}>
            <LoadingOverlay overlayOpacity={1}
                            overlayColor={theme.colors.dark[8]}
                            visible={isActionLoading || isFetcherLoading} />

            {(!isFetcherLoading && allTrackings.length === 0) ?
                <Center p={64}>
                    <Text align={"center"}>There are no {GameTrackingStatus[status].toLowerCase()} games.</Text>
                </Center> :
                <>
                    <Table striped highlightOnHover verticalSpacing={"md"} fontSize={"md"} width={"100%"}>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Title</th>
                            <th>Platform</th>
                            {!isMobile &&
                                (<>
                                    <th>Hours Played</th>
                                    <th>Format</th>
                                    <th>Status</th>
                                    <th>Ownership</th>
                                </>)}
                            {!readOnly && <th></th>}
                        </tr>
                        </thead>
                        <tbody>
                        {allTrackings.map((gt) => (
                            <tr key={`${gt.gameRemoteId}${gt.platform}`}>
                                <td>
                                    <CoverImage src={gt.coverImageURL} width={40} height={60}/>
                                </td>
                                <td>
                                    <Link style={{ color: theme.colors.dark[1], textDecoration: "none" }}
                                          to={`/home/games/${gt.gameRemoteId}`}>
                                        <Text sx={(theme) => ({
                                            width: isMobile ? "10ch" : "20ch",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        })}>
                                            {gt.title}
                                        </Text>
                                    </Link>
                                </td>
                                <td>
                                    <Group spacing={"sm"}>
                                        <PlatformIcon platform={gt.platform} />
                                        {gt.platform}
                                    </Group>
                                </td>
                                {!isMobile &&
                                    <>
                                        <td>{gt.hoursPlayed}</td>
                                        <td>{GameTrackingFormat[gt.format]}</td>
                                        <td>{GameTrackingStatus[gt.status]}</td>
                                        <td>{GameTrackingOwnership[gt.ownership]}</td>
                                    </>}
                                {!readOnly && 
                                    <td>
                                        <ActionIcon onClick={() => showGameTrackingEditorModal(
                                            modals,
                                            { ...gt, remoteId: gt.gameRemoteId, platforms: [gt.platform] },
                                            gt,
                                            [gt],
                                            () => {},
                                            (formData) => updateTracking(gt.gameRemoteId, formData),
                                            (formData) => removeTracking(gt.gameRemoteId, formData)
                                        )}>
                                            <Edit/>
                                        </ActionIcon>
                                    </td>
                                }
                            </tr>))}
                        </tbody>
                    </Table>

                    {(!isFetcherLoading && totalPages !== 0) &&
                        <Pagination size={"sm"} total={totalPages} page={currentPage} onChange={fetchPage}/>}
                </>
            }
        </Stack>
    );
}