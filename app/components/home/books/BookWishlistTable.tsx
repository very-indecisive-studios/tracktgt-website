import { ActionIcon, Center, LoadingOverlay, Pagination, Stack, Table, Text, useMantineTheme } from "@mantine/core";
import { useMobileQuery } from "~/utils/hooks";
import { useModals } from "@mantine/modals";
import React, { useEffect } from "react";
import CoverImage from "~/components/home/CoverImage";
import { Link } from "@remix-run/react";
import { TrashX } from "tabler-icons-react";
import { useBookWishlistActions } from "~/routes/home/books/wishlist/$id";
import { useAllBooksWishlist } from "~/routes/home/books/wishlist";
import { showBookWishlistRemoveConfirmModal } from "~/components/home/books/BookWishlistModals";

export default function BookWishlistTable() {
    const theme = useMantineTheme();
    const isMobile = useMobileQuery();
    const modals = useModals();

    const { allWishlists, currentPage, totalPages, fetchPage, isLoading: isFetcherLoading } = useAllBooksWishlist();
    const { removeFromWishlist, isLoading: isActionLoading } = useBookWishlistActions();
    useEffect(() => {
        if (!isActionLoading) {
            fetchPage(currentPage);
        }
    }, [isActionLoading]);
    
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
                <Center p={32}>
                    <Text>You do not have wishlisted books.</Text>
                </Center> :
                <>
                    <Table striped highlightOnHover verticalSpacing={"md"} fontSize={"md"} width={"100%"}>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Title</th>
                            <th></th>
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
                                <td>
                                    <ActionIcon onClick={() => showBookWishlistRemoveConfirmModal(
                                        modals,
                                        bw,
                                        () => removeFromWishlist(bw.bookRemoteId ?? "")
                                    )}>
                                        <TrashX color={"red"}/>
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