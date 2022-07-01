import { Link } from "@remix-run/react";
import React, { useEffect } from "react";
import { ActionIcon, Center, LoadingOverlay, Pagination, Stack, Table, Text, useMantineTheme } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useMobileQuery } from "~/utils/hooks";
import CoverImage from "~/components/home/CoverImage";
import { StarOff, TrashX } from "tabler-icons-react";
import { useBookWishlistActions } from "~/routes/home/books/wishlist/$bookId";
import { useAllBooksWishlist } from "~/routes/home/books/wishlist/all/$userId";
import { showBookWishlistRemoveConfirmModal } from "~/components/home/books/BookWishlistModals";

interface BookWishlistTableProps {
    userId: string;
    readOnly: boolean;
}

export default function BookWishlistTable({ userId, readOnly }: BookWishlistTableProps) {
    const theme = useMantineTheme();
    const isMobile = useMobileQuery();
    const modals = useModals();

    const { allWishlists, currentPage, totalPages, fetchPage, isLoading: isFetcherLoading, setUserId: setAllBooksWishlistUserId } 
        = useAllBooksWishlist(userId);
    const { removeFromWishlist, actionDone, isLoading: isActionLoading } = useBookWishlistActions();
   
    useEffect(() => {
        setAllBooksWishlistUserId(userId);
    }, [userId]);
   
    useEffect(() => {
        if (!isActionLoading) {
            fetchPage(currentPage);
        }
    }, [isActionLoading]);
    
    // Action notifications
    useEffect(() => {
        if (actionDone == "remove") {
            showNotification({
                title: 'Successfully removed book from wishlist.',
                message: `Your changes have been saved.`,
                icon: <StarOff size={16}/>,
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

            {(!isFetcherLoading && allWishlists.length === 0) ?
                <Center p={64}>
                    <Text align={"center"}>There are no wishlisted books.</Text>
                </Center> :
                <>
                    <Table striped highlightOnHover verticalSpacing={"md"} fontSize={"md"} width={"100%"}>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Title</th>
                            {!readOnly && <th></th>}
                        </tr>
                        </thead>
                        <tbody>
                        {allWishlists.map((bw) => (
                            <tr key={`${bw.bookRemoteId}`}>
                                <td>
                                    <CoverImage src={bw.coverImageURL} width={40} height={60}/>
                                </td>
                                <td>
                                    <Link style={{ color: theme.colors.dark[1], textDecoration: "none" }}
                                          to={`/home/books/${bw.bookRemoteId}`}>
                                        <Text sx={(theme) => ({
                                            width: isMobile ? "10ch" : "20ch",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        })}>
                                            {bw.title}
                                        </Text>
                                    </Link>
                                </td>
                                {!readOnly &&                                
                                    <td>
                                        <ActionIcon onClick={() => showBookWishlistRemoveConfirmModal(
                                            modals,
                                            { ...bw, remoteId: bw.bookRemoteId },
                                            (formData) => removeFromWishlist(bw.bookRemoteId, formData)
                                        )}>
                                            <TrashX color={"red"}/>
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