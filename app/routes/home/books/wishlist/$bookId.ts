import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { requireUserId } from "~/utils/session.server";
import {
    backendAPIClientInstance,
    RemoveBookWishlistCommand, 
    AddBookWishlistCommand
} from "backend";

//region Server

interface LoaderData {
    hasBookWishlist: boolean
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const userId = await requireUserId(request);
    const bookId = params.bookId ?? "";

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
    const bookId = params.bookId ?? "";
    
    if (request.method === "POST") {
        return handlePost(bookId, request);
    } else if (request.method === "DELETE") {
        return handleDelete(bookId, request);
    } else {
        return json({ message: "Method not allowed" }, 405);
    }
}

//endregion

//region Client

type Actions = "idle" | "add" | "update" | "remove";

interface BookWishlistActionsFunc {
    addToWishlist: (bookRemoteId: string, formData: FormData) => void;
    removeFromWishlist: (bookRemoteId: string, formData: FormData) => void;
    actionDone: Actions;
    isLoading: boolean;
}

export function useBookWishlistActions(): BookWishlistActionsFunc {
    const fetcherWishlistAction = useFetcher();

    const [isLoading, setIsLoading] = useState(false);
    const [actionDone, setIsActionDone] = useState<Actions>("idle");
    const [actionDoing, setIsActionDoing] = useState<Actions>("idle");

    useEffect(() => {
        if (fetcherWishlistAction.type === "done") {
            setIsLoading(false);
            setIsActionDone(actionDoing);
        }
    }, [fetcherWishlistAction.type]);
    
    const addToWishlist = (bookRemoteId: string, formData: FormData) => {
        fetcherWishlistAction.submit(
            formData,
            {
                action: `/home/books/wishlist/${bookRemoteId}`,
                method: "post"
            });

        setIsActionDoing("add");
        setIsLoading(true);
    };

    const removeFromWishlist = (bookRemoteId: string, formData: FormData) => {
        fetcherWishlistAction.submit(
            formData,
            {
                action: `/home/books/wishlist/${bookRemoteId}`,
                method: "delete"
            });
        
        setIsActionDoing("remove");
        setIsLoading(true);
    };

    return {
        addToWishlist,
        removeFromWishlist,
        actionDone,
        isLoading
    }
}

interface BookWishlistStateAndFunc {
    hasWishlist: boolean;
    addToWishlist: (formData: FormData) => void;
    removeFromWishlist: (formData: FormData) => void;
    actionDone: Actions;
    isLoading: boolean;
}

export function useBookWishlist(bookRemoteId: string): BookWishlistStateAndFunc {
    const fetcherWishlistLoader = useFetcher<LoaderData>();
    const fetcherWishlistAction = useFetcher();
    
    const [hasWishlist, setHasWishlist] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [actionDone, setIsActionDone] = useState<Actions>("idle");
    const [actionDoing, setIsActionDoing] = useState<Actions>("idle");

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
            setIsActionDone(actionDoing);
        }
    }, [fetcherWishlistAction.type]);
    
    const addToWishlist = (formData: FormData) => {
        fetcherWishlistAction.submit(
            formData, 
            { 
                action: `/home/books/wishlist/${bookRemoteId}`,
                method: "post"
            }
        );
        setIsActionDoing("add");
        setIsLoading(true);
    };

    const removeFromWishlist = (formData: FormData) => {
        fetcherWishlistAction.submit(
            formData,
            {
                action: `/home/books/wishlist/${bookRemoteId}`,
                method: "delete"
            }
        );
        setIsActionDoing("remove");
        setIsLoading(true);
    };
    
    return {
        hasWishlist,
        addToWishlist,
        removeFromWishlist,
        actionDone,
        isLoading
    }
}

//endregion
