import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { requireUserId } from "~/utils/session.server";
import { badRequest } from "~/utils/response.server";
import {
    AddShowTrackingCommand,
    backendAPIClientInstance, 
    GetShowTrackingResult,
    RemoveShowTrackingCommand, 
    ShowTrackingStatus, 
    UpdateShowTrackingCommand
} from "backend";

//region Server

interface LoaderData {
    showTracking: GetShowTrackingResult | null;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const showId = params.id ?? "0";
    const userId = await requireUserId(request);

    const getShowTrackingResponse = await backendAPIClientInstance.show_GetShowTracking(userId, showId);

    return json<LoaderData>({
        showTracking: getShowTrackingResponse.result
    });
}

const handleDelete = async (showId: string, request: Request) => {
    const userId = await requireUserId(request);

    await backendAPIClientInstance.show_RemoveShowTracking(new RemoveShowTrackingCommand({
        showRemoteId: showId,
        userRemoteId: userId
    }));

    return null;
}

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    const showStatusesLength = Object.keys(ShowTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .length;

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            episodesWatched: z.preprocess(preProcessToNumber, z.number().gte(0)),
            status: z.preprocess(preProcessToNumber, z.number().min(0).max(showStatusesLength - 1))
        });

    return formDataSchema.safeParse(formData);
}

const handlePost = async (showId: string, request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.show_AddShowTracking(new AddShowTrackingCommand({
        showRemoteId: showId,
        userRemoteId: userId,
        episodesWatched: parsedFormData.data.episodesWatched,
        status: parsedFormData.data.status
    }));

    return null;
}

const handlePut = async (showId: string, request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.show_UpdateShowTracking(new UpdateShowTrackingCommand({
        showRemoteId: showId,
        userRemoteId: userId,
        episodesWatched: parsedFormData.data.episodesWatched,
        status: parsedFormData.data.status
    }));

    return null;
}

export const action: ActionFunction = async ({ params, request }) => {
    const showId: string = params.id ?? "0";

    if (request.method === "POST") {
        return handlePost(showId, request);
    } else if (request.method === "DELETE") {
        return handleDelete(showId, request);
    } else if (request.method === "PUT") {
        return handlePut(showId, request);
    } else {
        return json({ message: "Method not allowed" }, 405);
    }
}

//endregion

//region Client

type Actions = "idle" | "add" | "update" | "remove"; 

interface ShowTrackingActionsFunc {
    addTracking: (showRemoteId: string, formData: FormData) => void;
    updateTracking: (showRemoteId: string, formData: FormData) => void
    removeTracking: (showRemoteId: string, formData: FormData) => void;
    actionDone: Actions;
    isLoading: boolean;
}

export function useShowTrackingActions(): ShowTrackingActionsFunc {
    const fetcherTrackingAction = useFetcher();

    const [isLoading, setIsLoading] = useState(false);
    const [actionDoing, setActionDoing] = useState<Actions>("idle");
    const [actionDone, setActionDone] = useState<Actions>("idle");
    
    useEffect(() => {
        if (fetcherTrackingAction.type === "done") {
            setIsLoading(false);
            setActionDone(actionDoing);
        }
    }, [fetcherTrackingAction.type]);

    const addTracking = (showRemoteId: string, formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/shows/track/${showRemoteId}`,
                method: "post"
            });
        setIsLoading(true);
        setActionDoing("add");
    };

    const updateTracking = (showRemoteId: string, formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/shows/track/${showRemoteId}`,
                method: "put"
            });
        setIsLoading(true);
        setActionDoing("update");
    };

    const removeTracking = (showRemoteId: string, formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/shows/track/${showRemoteId}`,
                method: "delete"
            });
        setIsLoading(true);
        setActionDoing("remove");
    };

    return {
        addTracking,
        updateTracking,
        removeTracking,
        actionDone,
        isLoading
    }
}

interface ShowTrackingStateAndFunc {
    tracking: GetShowTrackingResult | null;
    addTracking: (formData: FormData) => void;
    updateTracking: (formData: FormData) => void;
    removeTracking: (formData: FormData) => void;
    actionDone: Actions;
    isLoading: boolean;
}

export function useShowTracking(showRemoteId: string): ShowTrackingStateAndFunc {
    const fetcherTrackingLoader = useFetcher<LoaderData>();
    const fetcherTrackingAction = useFetcher();

    const [tracking, setTracking] = useState<GetShowTrackingResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionDoing, setActionDoing] = useState<Actions>("idle");
    const [actionDone, setActionDone] = useState<Actions>("idle");

    useEffect(() => {
        fetcherTrackingLoader.submit(
            null, 
            { 
                action: `/home/shows/track/${showRemoteId}`, 
                method: "get" 
            }
        );
        setIsLoading(true);
    }, []);

    useEffect(() => {
        if (fetcherTrackingLoader.type === "done") {
            setTracking(fetcherTrackingLoader.data.showTracking);
            setIsLoading(false);
            setActionDone(actionDoing);
        }
    }, [fetcherTrackingLoader.type]);

    useEffect(() => {
        if (fetcherTrackingAction.type === "done") {
            fetcherTrackingLoader.submit(
                null, 
                { 
                    action: `/home/shows/track/${showRemoteId}`, 
                    method: "get" 
                }
            );
            setIsLoading(true);
        }
    }, [fetcherTrackingAction.type]);

    const addTracking = (formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/shows/track/${showRemoteId}`,
                method: "post"
            });
        setIsLoading(true);
        setActionDoing("add");
    };

    const updateTracking = (formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/shows/track/${showRemoteId}`,
                method: "put"
            });
        setIsLoading(true);
        setActionDoing("update");
    };

    const removeTracking = (formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/shows/track/${showRemoteId}`,
                method: "delete"
            });
        setIsLoading(true);
        setActionDoing("remove");
    };

    return {
        tracking,
        addTracking,
        updateTracking,
        removeTracking,
        actionDone,
        isLoading
    }
}

//endregion
