import { ActionIcon, Center, LoadingOverlay, Pagination, Stack, Table, Text, useMantineTheme } from "@mantine/core";
import { useMobileQuery } from "~/utils/hooks";
import { useModals } from "@mantine/modals";
import { useAllGamesWishlist } from "~/routes/home/games/wishlist";
import { useGamesWishlistActions } from "~/routes/home/games/wishlist/$id";
import React, { useEffect } from "react";
import CoverImage from "~/components/home/CoverImage";
import { Link } from "@remix-run/react";
import { showGameWishlistRemoveConfirmModal } from "~/components/home/games/GameWishlistModals";
import { TrashX } from "tabler-icons-react";

export default function GameWishlistTable() {
    const theme = useMantineTheme();
    const isMobile = useMobileQuery();
    const modals = useModals();

    const { allWishlists, currentPage, totalPages, fetchPage, isLoading: isFetcherLoading } = useAllGamesWishlist();
    const { removeFromWishlist, isLoading: isActionLoading } = useGamesWishlistActions();
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
                    <Text align={"center"}>You do not have wishlisted games.</Text>
                </Center> :
                <>
                    <Table striped highlightOnHover verticalSpacing={"md"} fontSize={"md"} width={"100%"}>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Title</th>
                            <th>Platform</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {allWishlists.map((gw) => (
                            <tr key={`${gw.gameRemoteId}${gw.platform}`}>
                                <td>
                                    <CoverImage src={gw.coverImageURL} width={40} height={60}/>
                                </td>
                                <td>
                                    <Link style={{ color: theme.colors.dark[1], textDecoration: "none" }}
                                          to={`/home/games/${gw.gameRemoteId}`}>
                                        <Text sx={(theme) => ({
                                            width: isMobile ? "10ch" : "20ch",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        })}>
                                            {gw.title}
                                        </Text>
                                    </Link>
                                </td>
                                <td>{gw.platform}</td>
                                <td>
                                    <ActionIcon onClick={() => showGameWishlistRemoveConfirmModal(
                                        modals, gw,
                                        gw.platform ?? "",
                                        (formData) => removeFromWishlist(gw.gameRemoteId!!, formData)
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