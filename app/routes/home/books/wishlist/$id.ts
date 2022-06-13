import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { requireUserId } from "~/utils/session.server";
import { badRequest } from "~/utils/response.server";
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

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    // Validate form.
    const formDataSchema = z
        .object({
            bookRemoteId: z.string()
        });

    return formDataSchema.safeParse(formData);
}

const handleDelete = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())
    
    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.book_RemoveBookWishlist(new RemoveBookWishlistCommand({
        bookRemoteId: parsedFormData.data.bookRemoteId,
        userRemoteId: userId,
    }));

    return null;
}

const handlePost = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.book_AddBookWishlist(new AddBookWishlistCommand({
        bookRemoteId: parsedFormData.data.bookRemoteId,
        userRemoteId: userId,
    }));

    return null;
}

export const action: ActionFunction = async ({ request }) => {
    if (request.method === "POST") {
        return handlePost(request);
    } else if (request.method === "DELETE") {
        return handleDelete(request);
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
            {
                bookRemoteId: bookRemoteId,
            },
            {
                action: `/home/books/wishlist/${bookRemoteId}`,
                method: "post"
            });

        setIsLoading(true);
    };

    const removeFromWishlist = (bookRemoteId: string) => {
        fetcherWishlistAction.submit(
            {
                bookRemoteId: bookRemoteId,
            },
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
            {
                bookRemoteId: bookRemoteId
            }, 
            { 
                action: `/home/books/wishlist/${bookRemoteId}`,
                method: "post"
            });
        setIsLoading(true);
    };

    const removeFromWishlist = () => {
        fetcherWishlistAction.submit(
            {
                bookRemoteId: bookRemoteId
            },
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
