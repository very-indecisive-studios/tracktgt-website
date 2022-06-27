import {
    AddGameTrackingCommand,
    backendAPIClientInstance,
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus,
    GetGameTrackingsItemResult,
    RemoveGameTrackingCommand, UpdateGameTrackingCommand
} from "backend";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

// region Server

interface LoaderData {
    gameTrackings: GetGameTrackingsItemResult[]
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const gameId: number = parseInt(params.gameId ?? "0");
    const userId = await requireUserId(request);

    const getGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetGameTrackings(userId, gameId);

    return json<LoaderData>({
        gameTrackings: getGameTrackingsBackendAPIResponse.result.items
    });
}

const handleDelete = async (gameId: number, request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    // Validate form.
    const formDataSchema = z
        .object({
            platform: z.string(),
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.game_RemoveGameTracking(new RemoveGameTrackingCommand({
        gameRemoteId: gameId,
        userRemoteId: userId,
        platform: parsedFormData.data.platform
    }));

    return null;
}

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    const gameStatusesLength = Object.keys(GameTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .length;

    const gameFormatsLength = Object.keys(GameTrackingFormat)
        .filter((s) => isNaN(Number(s)))
        .length;

    const gameOwnershipsLength = Object.keys(GameTrackingOwnership)
        .filter((s) => isNaN(Number(s)))
        .length;

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            hoursPlayed: z.preprocess(preProcessToNumber, z.number().gte(0)),
            platform: z.string(),
            status: z.preprocess(preProcessToNumber, z.number().min(0).max(gameStatusesLength - 1)),
            format: z.preprocess(preProcessToNumber, z.number().min(0).max(gameFormatsLength - 1)),
            ownership: z.preprocess(preProcessToNumber, z.number().min(0).max(gameOwnershipsLength - 1))
        });

    return formDataSchema.safeParse(formData);
}

const handlePost = async (gameId: number, request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.game_AddGameTracking(new AddGameTrackingCommand({
        gameRemoteId: gameId,
        userRemoteId: userId,
        hoursPlayed: parsedFormData.data.hoursPlayed,
        platform: parsedFormData.data.platform,
        ownership: parsedFormData.data.ownership,
        format: parsedFormData.data.format,
        status: parsedFormData.data.status,
    }));

    return null;
}

const handlePut = async (gameId: number, request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.game_UpdateGameTracking(new UpdateGameTrackingCommand({
        gameRemoteId: gameId,
        userRemoteId: userId,
        hoursPlayed: parsedFormData.data.hoursPlayed,
        platform: parsedFormData.data.platform,
        ownership: parsedFormData.data.ownership,
        format: parsedFormData.data.format,
        status: parsedFormData.data.status,
    }));

    return null;
}

export const action: ActionFunction = async ({ params, request }) => {
    const gameId = parseInt(params.gameId ?? "0")

    if (request.method === "POST") {
        return handlePost(gameId, request);
    } else if (request.method === "PUT") {
        return handlePut(gameId, request);
    } else if (request.method === "DELETE") {
        return handleDelete(gameId, request);
    } else {
        return json({ message: "Method not allowed" }, 405);
    }
}

// endregion

// region Client

type Actions = "idle" | "add" | "update" | "remove";

interface GameTrackingsActionsFunc {
    addTracking: (gameRemoteId: number, formData: FormData) => void;
    updateTracking: (gameRemoteId: number, formData: FormData) => void
    removeTracking: (gameRemoteId: number, formData: FormData) => void;
    actionDone: Actions;
    isLoading: boolean;
}

export function useGameTrackingsActions(): GameTrackingsActionsFunc {
    const fetcherTrackingsAction = useFetcher();

    const [isLoading, setIsLoading] = useState(false);
    const [actionDone, setIsActionDone] = useState<Actions>("idle");
    const [actionDoing, setIsActionDoing] = useState<Actions>("idle");

    useEffect(() => {
        if (fetcherTrackingsAction.type === "done") {
            setIsLoading(false);
            setIsActionDone(actionDoing);
        }
    }, [fetcherTrackingsAction.type]);

    const addTracking = (gameRemoteId: number, formData: FormData) => {
        fetcherTrackingsAction.submit(
            formData,
            {
                action: `/home/games/track/${gameRemoteId}`,
                method: "post"
            });
        setIsActionDoing("add");
        setIsLoading(true);
    };

    const updateTracking = (gameRemoteId: number, formData: FormData) => {
        fetcherTrackingsAction.submit(
            formData,
            {
                action: `/home/games/track/${gameRemoteId}`,
                method: "put"
            });
        setIsActionDoing("update");
        setIsLoading(true);
    };

    const removeTracking = (gameRemoteId: number, formData: FormData) => {
        fetcherTrackingsAction.submit(
            formData,
            {
                action: `/home/games/track/${gameRemoteId}`,
                method: "delete"
            });
        setIsActionDoing("remove");
        setIsLoading(true);
    };

    return {
        addTracking,
        updateTracking,
        removeTracking,
        actionDone,
        isLoading
    }
}

interface GameTrackingsStateAndFunc {
    trackings: GetGameTrackingsItemResult[];
    addTracking: (formData: FormData) => void;
    updateTracking: (formData: FormData) => void
    removeTracking: (formData: FormData) => void;
    actionDone: Actions;
    isLoading: boolean;
}

export function useGameTrackings(gameRemoteId: number): GameTrackingsStateAndFunc {
    const fetcherTrackingsLoader = useFetcher<LoaderData>();
    const fetcherTrackingsAction = useFetcher();

    const [trackings, setTrackings] = useState<GetGameTrackingsItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionDone, setIsActionDone] = useState<Actions>("idle");
    const [actionDoing, setIsActionDoing] = useState<Actions>("idle");
    
    useEffect(() => {
        fetcherTrackingsLoader.submit(null, { action: `/home/games/track/${gameRemoteId}`, method: "get" });
        setIsLoading(true);
    }, []);

    useEffect(() => {
        if (fetcherTrackingsLoader.type === "done") {
            setTrackings(fetcherTrackingsLoader.data.gameTrackings);
            setIsActionDone(actionDoing);
            setIsLoading(false);
        }
    }, [fetcherTrackingsLoader.type]);

    useEffect(() => {
        if (fetcherTrackingsAction.type === "done") {
            fetcherTrackingsLoader.submit(null, { action: `/home/games/track/${gameRemoteId}`, method: "get" });
            setIsLoading(true);
        }
    }, [fetcherTrackingsAction.type]);

    const addTracking = (formData: FormData) => {
        fetcherTrackingsAction.submit(
            formData,
            {
                action: `/home/games/track/${gameRemoteId}`,
                method: "post"
            }
        );
        setIsActionDoing("add");
        setIsLoading(true);
    };

    const updateTracking = (formData: FormData) => {
        fetcherTrackingsAction.submit(
            formData,
            {
                action: `/home/games/track/${gameRemoteId}`,
                method: "put"
            }
        );
        setIsActionDoing("update");
        setIsLoading(true);
    };

    const removeTracking = (formData: FormData) => {
        fetcherTrackingsAction.submit(
            formData,
            {
                action: `/home/games/track/${gameRemoteId}`,
                method: "delete"
            }
        );
        setIsActionDoing("remove");
        setIsLoading(true);
    };

    return {
        trackings,
        addTracking,
        updateTracking,
        removeTracking,
        actionDone,
        isLoading
    }
}

// endregion
