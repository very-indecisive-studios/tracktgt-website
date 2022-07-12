import {
    backendAPIClientInstance, 
    GetAllBookWishlistsItemResult,
} from "backend";
import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

//region Server

interface LoaderData {
    bookWishlists: GetAllBookWishlistsItemResult[];
    currentPage: number;
    totalPages: number;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);
    
    const userId = params.userId ?? "";

    const url = new URL(request.url);
    const urlSearchParams = url.searchParams;
    const page = parseInt(urlSearchParams.get("page") ?? "1");
    
    const backendAPIResponse = await backendAPIClientInstance.book_GetAllBookWishlists(
        userId,
        true,
        page,
        5
    );

    return json<LoaderData>({
        bookWishlists: backendAPIResponse.result.items,
        currentPage: backendAPIResponse.result.page,
        totalPages: backendAPIResponse.result.totalPages
    });
}

//endregion

//region Client

interface BookWishlistStateAndFunc {
    allWishlists: GetAllBookWishlistsItemResult[];
    currentPage: number;
    totalPages: number;
    fetchPage: (page: number) => void;
    isLoading: boolean;
    setUserId: (userId: string) => void;
}

export function useAllBooksWishlist(targetUserId: string, initialPage?: number): BookWishlistStateAndFunc {
    const [userId, setUserId] = useState(targetUserId);

    const fetcherAllWishlistLoader = useFetcher<LoaderData>();

    const [currentPage, setCurrentPage] = useState(initialPage ?? 1);
    const [totalPages, setTotalPages] = useState(1);
    const [allWishlists, setAllWishlists] = useState<GetAllBookWishlistsItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetcherAllWishlistLoader.submit(
            null, 
            { 
                action: `/home/books/wishlist/all/${userId}?page=${currentPage}`, 
                method: "get" 
            }
        );
        setIsLoading(true);
    }, [userId]);
    
    useEffect(() => {
        if (fetcherAllWishlistLoader.type === "done") {
            setAllWishlists(fetcherAllWishlistLoader.data.bookWishlists);
            setTotalPages(fetcherAllWishlistLoader.data.totalPages);
            setCurrentPage(fetcherAllWishlistLoader.data.currentPage);
            setIsLoading(false);
        }
    }, [fetcherAllWishlistLoader.type]);

    const fetchPage = (page: number) => {
        fetcherAllWishlistLoader.submit(
            null, 
            { 
                action: `/home/books/wishlist/all/${userId}?page=${page}`, 
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
        isLoading,
        setUserId
    }
}

//endregion
