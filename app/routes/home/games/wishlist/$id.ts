import {
    backendAPIClientInstance,
    GetGameWishlistItemResult,
    AddGameWishlistCommand,
    RemoveGameWishlistCommand
} from "backend";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

interface LoaderData {
    gameWishlists: GetGameWishlistItemResult[]
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const userId = await requireUserId(request);
    const gameId: number = parseInt(params.id ?? "0");

    const backendAPIResponse = await backendAPIClientInstance.game_GetGameWishlists(userId, gameId);

    return json<LoaderData>({
        gameWishlists: backendAPIResponse.result.items ?? []
    });
}

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    // Validate form.
    const formDataSchema = z
        .object({
            platform: z.string(),
        });

    return formDataSchema.safeParse(formData);
}

const handleDelete = async (gameId: number, request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())
    
    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.game_RemoveGameWishlist(new RemoveGameWishlistCommand({
        gameRemoteId: gameId,
        userRemoteId: userId,
        platform: parsedFormData.data.platform
    }));

    return null;
}

const handlePost = async (gameId: number, request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.game_AddGameWishlist(new AddGameWishlistCommand({
        gameRemoteId: gameId,
        userRemoteId: userId,
        platform: parsedFormData.data.platform
    }));

    return null;
}

export const action: ActionFunction = async ({ params, request }) => {
    const gameId = parseInt(params.id ?? "0");
    
    if (request.method === "POST") {
        return handlePost(gameId, request);
    } else if (request.method === "DELETE") {
        return handleDelete(gameId, request);
    } else {
        return json({ message: "Method not allowed" }, 405);
    }
}
interface GameWishlistActionsFunc {
    addToWishlist: (gameRemoteId: number, formData: FormData) => void;
    removeFromWishlist: (gameRemoteId: number, formData: FormData) => void;
    isLoading: boolean;
}

export function useGamesWishlistActions(): GameWishlistActionsFunc {
    const fetcherWishlistAction = useFetcher();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (fetcherWishlistAction.type === "done") {
            setIsLoading(false);
        }
    }, [fetcherWishlistAction.type]);
    
    const addToWishlist = (gameRemoteId: number, formData: FormData) => {
        fetcherWishlistAction.submit(
            formData,
            {
                action: `/home/games/wishlist/${gameRemoteId}`,
                method: "post"
            });

        setIsLoading(true);
    };

    const removeFromWishlist = (gameRemoteId: number, formData: FormData) => {
        fetcherWishlistAction.submit(
            formData,
            {
                action: `/home/games/wishlist/${gameRemoteId}`,
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

interface GameWishlistStateAndFunc {
    wishlists: GetGameWishlistItemResult[];
    addToWishlist: (formData: FormData) => void;
    removeFromWishlist: (formData: FormData) => void;
    isLoading: boolean;
}

export function useGamesWishlist(gameRemoteId: number): GameWishlistStateAndFunc {
    const fetcherWishlistLoader = useFetcher<LoaderData>();
    const fetcherWishlistAction = useFetcher();
    
    const [wishlists, setWishlists] = useState<GetGameWishlistItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        fetcherWishlistLoader.submit(null, { action: `/home/games/wishlist/${gameRemoteId}`, method: "get" });
        setIsLoading(true);
    }, []);
    
    useEffect(() => {
        if (fetcherWishlistLoader.type === "done") {
            setWishlists(fetcherWishlistLoader.data.gameWishlists);
            setIsLoading(false);
        }
    }, [fetcherWishlistLoader.type]);
    
    useEffect(() => {
        if (fetcherWishlistAction.type === "done") {
            fetcherWishlistLoader.submit(null, { action: `/home/games/wishlist/${gameRemoteId}`, method: "get" });
            setIsLoading(true);
        }
    }, [fetcherWishlistAction.type]);
    
    const addToWishlist = (formData: FormData) => {
        fetcherWishlistAction.submit(
            formData, 
            { 
                action: `/home/games/wishlist/${gameRemoteId}`,
                method: "post"
            });
        setIsLoading(true);
    };

    const removeFromWishlist = (formData: FormData) => {
        fetcherWishlistAction.submit(
            formData,
            {
                action: `/home/games/wishlist/${gameRemoteId}`,
                method: "delete"
            });
        setIsLoading(true);
    };
    
    return {
        wishlists,
        addToWishlist,
        removeFromWishlist,
        isLoading
    }
}
