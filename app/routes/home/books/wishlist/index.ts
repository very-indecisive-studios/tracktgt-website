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

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    
    const url = new URL(request.url);
    const urlSearchParams = url.searchParams;
    const page = parseInt(urlSearchParams.get("page") ?? "1");
    
    const backendAPIResponse = await backendAPIClientInstance.book_GetAllBookWishlists(
        userId,
        page,
        5
    );

    return json<LoaderData>({
        bookWishlists: backendAPIResponse.result.items ?? [],
        currentPage: backendAPIResponse.result.page ?? 1,
        totalPages: backendAPIResponse.result.totalPages ?? 0
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
}

export function useAllBooksWishlist(initialPage?: number): BookWishlistStateAndFunc {
    const fetcherAllWishlistLoader = useFetcher<LoaderData>();

    const [currentPage, setCurrentPage] = useState(initialPage ?? 1);
    const [totalPages, setTotalPages] = useState(1);
    const [allWishlists, setAllWishlists] = useState<GetAllBookWishlistsItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetcherAllWishlistLoader.submit(
            null, 
            { 
                action: `/home/books/wishlist?index&page=${currentPage}`, 
                method: "get" 
            }
        );
        setIsLoading(true);
    }, []);
    
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
                action: `/home/books/wishlist?index&page=${page}`, 
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
