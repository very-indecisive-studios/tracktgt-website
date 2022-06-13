import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { requireUserId } from "~/utils/session.server";
import {
    backendAPIClientInstance,
    RemoveBookWishlistCommand, 
    AddBookWishlistCommand
} from "backend";

interface LoaderData {
    hasBookWishlist: boolean
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const userId = await requireUserId(request);
    const bookId = params.id ?? "";

    const backendAPIResponse = await backendAPIClientInstance.book_GetBookWishlist(userId, bookId);

    return json<LoaderData>({
        hasBookWishlist: backendAPIResponse.result
    });
}

const handleDelete = async (bookId: string, request: Request) => {
    const userId = await requireUserId(request);
    
    await backendAPIClientInstance.book_RemoveBookWishlist(new RemoveBookWishlistCommand({
        bookRemoteId: bookId,
        userRemoteId: userId,
    }));

    return null;
}

const handlePost = async (bookId: string, request: Request) => {
    const userId = await requireUserId(request);

    await backendAPIClientInstance.book_AddBookWishlist(new AddBookWishlistCommand({
        bookRemoteId: bookId,
        userRemoteId: userId,
    }));

    return null;
}

export const action: ActionFunction = async ({ params, request }) => {
    const bookId = params.id ?? "";
    
    if (request.method === "POST") {
        return handlePost(bookId, request);
    } else if (request.method === "DELETE") {
        return handleDelete(bookId, request);
    } else {
        return json({ message: "Method not allowed" }, 405);
    }
}

interface BookWishlistActionsFunc {
    addToWishlist: (bookRemoteId: string) => void;
    removeFromWishlist: (bookRemoteId: string) => void;
    isLoading: boolean;
}

export function useBookWishlistActions(): BookWishlistActionsFunc {
    const fetcherWishlistAction = useFetcher();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (fetcherWishlistAction.type === "done") {
            setIsLoading(false);
        }
    }, [fetcherWishlistAction.type]);
    
    const addToWishlist = (bookRemoteId: string) => {
        fetcherWishlistAction.submit(
            null,
            {
                action: `/home/books/wishlist/${bookRemoteId}`,
                method: "post"
            });

        setIsLoading(true);
    };

    const removeFromWishlist = (bookRemoteId: string) => {
        fetcherWishlistAction.submit(
            null,
            {
                action: `/home/books/wishlist/${bookRemoteId}`,
                method: "delete"
            });

        setIsLoading(true);
    };

    return {
        addToWishlist,
        removeFromWishlist,
        isLoading
    }
}

interface BookWishlistStateAndFunc {
    hasWishlist: boolean;
    addToWishlist: () => void;
    removeFromWishlist: () => void;
    isLoading: boolean;
}

export function useBookWishlist(bookRemoteId: string): BookWishlistStateAndFunc {
    const fetcherWishlistLoader = useFetcher<LoaderData>();
    const fetcherWishlistAction = useFetcher();
    
    const [hasWishlist, setHasWishlist] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        fetcherWishlistLoader.submit(null, { action: `/home/books/wishlist/${bookRemoteId}`, method: "get" });
        setIsLoading(true);
    }, []);
    
    useEffect(() => {
        if (fetcherWishlistLoader.type === "done") {
            setHasWishlist(fetcherWishlistLoader.data.hasBookWishlist);
            setIsLoading(false);
        }
    }, [fetcherWishlistLoader.type]);
    
    useEffect(() => {
        if (fetcherWishlistAction.type === "done") {
            fetcherWishlistLoader.submit(null, { action: `/home/books/wishlist/${bookRemoteId}`, method: "get" });
            setIsLoading(true);
        }
    }, [fetcherWishlistAction.type]);
    
    const addToWishlist = () => {
        fetcherWishlistAction.submit(
            null, 
            { 
                action: `/home/books/wishlist/${bookRemoteId}`,
                method: "post"
            });
        setIsLoading(true);
    };

    const removeFromWishlist = () => {
        fetcherWishlistAction.submit(
            null,
            {
                action: `/home/books/wishlist/${bookRemoteId}`,
                method: "delete"
            });
        setIsLoading(true);
    };
    
    return {
        hasWishlist,
        addToWishlist,
        removeFromWishlist,
        isLoading
    }
}
