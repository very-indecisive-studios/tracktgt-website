import { Link } from "@remix-run/react";
import React, { useEffect } from "react";
import { ActionIcon, Center, LoadingOverlay, Pagination, Stack, Table, Text, useMantineTheme } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Edit, Pencil, TrashX } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import CoverImage from "~/components/home/CoverImage";
import { showShowTrackingEditorModal } from "~/components/home/shows/ShowTrackingModals";
import { useAllShowsTrackings } from "~/routes/home/shows/track";
import { useShowTrackingActions } from "~/routes/home/shows/track/$id";
import { ShowTrackingStatus, ShowType } from "backend";

interface ShowTrackingStatusTableProps {
    status: ShowTrackingStatus;
}

export function ShowTrackingStatusTable({ status }: ShowTrackingStatusTableProps) {
    const theme = useMantineTheme();
    const isMobile = useMobileQuery();
    const modals = useModals();

    const { allTrackings, currentPage, totalPages, fetchPage, isLoading: isFetcherLoading } = useAllShowsTrackings(status);
    const { updateTracking, removeTracking, isLoading: isActionLoading, actionDone } = useShowTrackingActions();
    useEffect(() => {
        if (!isActionLoading) {
            fetchPage(currentPage);
        }
    }, [isActionLoading]);
    useEffect(() => {
        if (actionDone == "update") {
            showNotification({
                title: 'Successfully updated show tracking.',
                message: `Your changes have been saved.`,
                icon: <Pencil size={16}/>,
                color: "green"
            });
        } else if (actionDone == "remove") {
            showNotification({
                title: 'Successfully removed show tracking.',
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
                <Center p={32}>
                    <Text align={"center"}>You do not have {ShowTrackingStatus[status].toLowerCase()} shows.</Text>
                </Center> :
                <>
                    <Table striped highlightOnHover verticalSpacing={"md"} fontSize={"md"} width={"100%"}>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Title</th>
                            <th>Episodes Watched</th>
                            {!isMobile &&
                                (<>
                                    <th>Status</th>
                                    <th>Show Type</th>
                                </>)}
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {allTrackings.map((st) => (
                            <tr key={`${st.showRemoteId}`}>
                                <td>
                                    <CoverImage src={st.coverImageURL} width={40} height={60}/>
                                </td>
                                <td>
                                    <Link style={{ color: theme.colors.dark[1], textDecoration: "none" }}
                                          to={`/home/shows/${st.showRemoteId}`}>
                                        <Text sx={(theme) => ({
                                            width: isMobile ? "10ch" : "20ch",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        })}>
                                            {st.title}
                                        </Text>
                                    </Link>
                                </td>
                                <td>{st.episodesWatched}</td>
                                {!isMobile &&
                                    <>
                                        <td>{ShowTrackingStatus[st.status!!]}</td>
                                        <td>{ShowType[st.showType!!]}</td>
                                    </>}
                                <td>
                                    <ActionIcon onClick={() => showShowTrackingEditorModal(
                                        modals,
                                        st,
                                        st,
                                        () => { },
                                        (formData) => updateTracking(st.showRemoteId!!, formData),
                                        (formData) => removeTracking(st.showRemoteId!!, formData)
                                    )}>
                                        <Edit/>
                                    </ActionIcon>
                                </td>
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
