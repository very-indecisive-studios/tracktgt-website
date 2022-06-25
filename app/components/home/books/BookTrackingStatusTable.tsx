import { Link } from "@remix-run/react";
import React, { useEffect } from "react";
import { ActionIcon, Center, LoadingOverlay, Pagination, Stack, Table, Text, useMantineTheme } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useModals } from "@mantine/modals";
import { Edit, Pencil, TrashX } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import CoverImage from "~/components/home/CoverImage";
import { showBookTrackingEditorModal } from "~/components/home/books/BookTrackingModals";
import { useAllBooksTrackings } from "~/routes/home/books/track";
import { useBookTrackingActions } from "~/routes/home/books/track/$id";
import {
    BookTrackingFormat,
    BookTrackingOwnership,
    BookTrackingStatus,
} from "backend";

interface BookTrackingStatusTableProps {
    status: BookTrackingStatus;
}

export default function BookTrackingStatusTable({ status }: BookTrackingStatusTableProps) {
    const theme = useMantineTheme();
    const isMobile = useMobileQuery();
    const modals = useModals();

    const { allTrackings, currentPage, totalPages, fetchPage, isLoading: isFetcherLoading } = useAllBooksTrackings(status);
    const { addTracking, updateTracking, removeTracking, actionDone, isLoading: isActionLoading } = useBookTrackingActions();
    useEffect(() => {
        if (!isActionLoading) {
            fetchPage(currentPage);
        }
    }, [isActionLoading]);

    // Action notifications
    useEffect(() => {
        if (actionDone == "update") {
            showNotification({
                title: 'Successfully updated book tracking.',
                message: `Your changes have been saved.`,
                icon: <Pencil size={16}/>,
                color: "green"
            });
        } else if (actionDone == "remove") {
            showNotification({
                title: 'Successfully removed book tracking.',
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
                    <Text align={"center"}>You do not have {BookTrackingStatus[status].toLowerCase()} books.</Text>
                </Center> :
                <>
                    <Table striped highlightOnHover verticalSpacing={"md"} fontSize={"md"} width={"100%"}>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Title</th>
                            <th>Chapters Read</th>
                            {!isMobile &&
                                (<>
                                    <th>Format</th>
                                    <th>Status</th>
                                    <th>Ownership</th>
                                </>)}
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {allTrackings.map((bt) => (
                            <tr key={`${bt.bookRemoteId}`}>
                                <td>
                                    <CoverImage src={bt.coverImageURL} width={40} height={60}/>
                                </td>
                                <td>
                                    <Link style={{ color: theme.colors.dark[1], textDecoration: "none" }}
                                          to={`/home/books/${bt.bookRemoteId}`}>
                                        <Text sx={(theme) => ({
                                            width: isMobile ? "10ch" : "20ch",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        })}>
                                            {bt.title}
                                        </Text>
                                    </Link>
                                </td>
                                <td>{bt.chaptersRead}</td>
                                {!isMobile &&
                                    <>
                                        <td>{BookTrackingFormat[bt.format]}</td>
                                        <td>{BookTrackingStatus[bt.status]}</td>
                                        <td>{BookTrackingOwnership[bt.ownership]}</td>
                                    </>}
                                <td>
                                    <ActionIcon onClick={() => showBookTrackingEditorModal(
                                        modals,
                                        { ...bt, remoteId: bt.bookRemoteId },
                                        bt,
                                        (formData) => addTracking(bt.bookRemoteId, formData),
                                        (formData) => updateTracking(bt.bookRemoteId, formData),
                                        (formData) => removeTracking(bt.bookRemoteId, formData)
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