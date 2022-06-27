import { json, LoaderFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { requireUserId } from "~/utils/session.server";
import {
    backendAPIClientInstance,
    GetAllGameWishlistsItemResult
} from "backend";

//region Server

interface LoaderData {
    gameWishlists: GetAllGameWishlistsItemResult[];
    currentPage: number;
    totalPages: number;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);

    const userId = params.userId ?? "";

    const url = new URL(request.url);
    const urlSearchParams = url.searchParams;
    const page = parseInt(urlSearchParams.get("page") ?? "1");

    const backendAPIResponse = await backendAPIClientInstance.game_GetAllGameWishlists(
        userId,
        false,
        page,
        5
    );

    return json<LoaderData>({
        gameWishlists: backendAPIResponse.result.items,
        currentPage: backendAPIResponse.result.page,
        totalPages: backendAPIResponse.result.totalPages
    });
}

//endregion

//region Client

interface GameWishlistStateAndFunc {
    allWishlists: GetAllGameWishlistsItemResult[];
    currentPage: number;
    totalPages: number;
    fetchPage: (page: number) => void;
    isLoading: boolean;
}

export function useAllGamesWishlist(userId: string, initialPage?: number): GameWishlistStateAndFunc {
    const fetcherAllWishlistLoader = useFetcher<LoaderData>();

    const [currentPage, setCurrentPage] = useState(initialPage ?? 1);
    const [totalPages, setTotalPages] = useState(1);
    const [allWishlists, setAllWishlists] = useState<GetAllGameWishlistsItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetcherAllWishlistLoader.submit(
            null, 
            {
                action: `/home/games/wishlist/all/${userId}?page=${currentPage}`,
                method: "get"
            }
        );
        setIsLoading(true);
    }, []);

    useEffect(() => {
        if (fetcherAllWishlistLoader.type === "done") {
            setAllWishlists(fetcherAllWishlistLoader.data.gameWishlists);
            setTotalPages(fetcherAllWishlistLoader.data.totalPages);
            setCurrentPage(fetcherAllWishlistLoader.data.currentPage);
            setIsLoading(false);
        }
    }, [fetcherAllWishlistLoader.type]);

    const fetchPage = (page: number) => {
        fetcherAllWishlistLoader.submit(
            null, 
            { 
                action: `/home/games/wishlist/all/${userId}?page=${page}`, 
                method: "get" 
            }
        );
        setIsLoading(true);
    };

    return {
        allWishlists,
        currentPage,
        totalPages,
        fetchPage,
        isLoading: isLoading
    }
}

//endregion
