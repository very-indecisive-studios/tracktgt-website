import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { requireUserId } from "~/utils/session.server";
import { badRequest } from "~/utils/response.server";
import {
    AddBookTrackingCommand,
    backendAPIClientInstance, 
    BookTrackingFormat, 
    BookTrackingOwnership,
    BookTrackingStatus,
    GetBookTrackingResult,
    RemoveBookTrackingCommand,
    UpdateBookTrackingCommand
} from "backend";

//region Server

interface LoaderData {
    bookTracking: GetBookTrackingResult | null;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const bookId: string = params.bookId ?? "0";
    const userId = await requireUserId(request);

    const getBookTrackingResponse = await backendAPIClientInstance.book_GetBookTracking(userId, bookId);

    return json<LoaderData>({
        bookTracking: getBookTrackingResponse.result
    });
}

const handleDelete = async (bookId: string, request: Request) => {
    const userId = await requireUserId(request);

    await backendAPIClientInstance.book_RemoveBookTracking(new RemoveBookTrackingCommand({
        bookRemoteId: bookId,
        userRemoteId: userId
    }));

    return null;
}

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    const bookStatusesLength = Object.keys(BookTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .length;

    const bookFormatsLength = Object.keys(BookTrackingFormat)
        .filter((s) => isNaN(Number(s)))
        .length;

    const bookOwnershipsLength = Object.keys(BookTrackingOwnership)
        .filter((s) => isNaN(Number(s)))
        .length;

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            chaptersRead: z.preprocess(preProcessToNumber, z.number().gte(0)),
            status: z.preprocess(preProcessToNumber, z.number().min(0).max(bookStatusesLength - 1)),
            format: z.preprocess(preProcessToNumber, z.number().min(0).max(bookFormatsLength - 1)),
            ownership: z.preprocess(preProcessToNumber, z.number().min(0).max(bookOwnershipsLength - 1))
        });

    return formDataSchema.safeParse(formData);
}

const handlePost = async (bookId: string, request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.book_AddBookTracking(new AddBookTrackingCommand({
        bookRemoteId: bookId,
        userRemoteId: userId,
        chaptersRead: parsedFormData.data.chaptersRead,
        ownership: parsedFormData.data.ownership,
        format: parsedFormData.data.format,
        status: parsedFormData.data.status,
    }));

    return null;
}

const handlePut = async (bookId: string, request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.book_UpdateBookTracking(new UpdateBookTrackingCommand({
        bookRemoteId: bookId,
        userRemoteId: userId,
        chaptersRead: parsedFormData.data.chaptersRead,
        ownership: parsedFormData.data.ownership,
        format: parsedFormData.data.format,
        status: parsedFormData.data.status,
    }));

    return null;
}

export const action: ActionFunction = async ({ params, request }) => {
    const bookId: string = params.bookId ?? "0";

    if (request.method === "POST") {
        return handlePost(bookId, request);
    } else if (request.method === "PUT") {
        return handlePut(bookId, request);
    } else if (request.method === "DELETE") {
        return handleDelete(bookId, request);
    } else {
        return json({ message: "Method not allowed" }, 405);
    }
}

//endregion

//region Client

type Actions = "idle" | "add" | "update" | "remove";

interface BookTrackingActionsFunc {
    addTracking: (bookRemoteId: string, formData: FormData) => void;
    updateTracking: (bookRemoteId: string, formData: FormData) => void
    removeTracking: (bookRemoteId: string, formData: FormData) => void;
    actionDone: Actions;
    isLoading: boolean;
}

export function useBookTrackingActions(): BookTrackingActionsFunc {
    const fetcherTrackingAction = useFetcher();

    const [isLoading, setIsLoading] = useState(false);
    const [actionDone, setIsActionDone] = useState<Actions>("idle");
    const [actionDoing, setIsActionDoing] = useState<Actions>("idle");

    useEffect(() => {
        if (fetcherTrackingAction.type === "done") {
            setIsLoading(false);
            setIsActionDone(actionDoing);
        }
    }, [fetcherTrackingAction.type]);

    const addTracking = (bookRemoteId: string, formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/books/track/${bookRemoteId}`,
                method: "post"
            }
        );
        setIsActionDoing("add");
        setIsLoading(true);
    };

    const updateTracking = (bookRemoteId: string, formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/books/track/${bookRemoteId}`,
                method: "put"
            }
        );
        setIsActionDoing("update");
        setIsLoading(true);
    };

    const removeTracking = (bookRemoteId: string, formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/books/track/${bookRemoteId}`,
                method: "delete"
            }
        );
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

interface BookTrackingStateAndFunc {
    tracking: GetBookTrackingResult | null;
    addTracking: (formData: FormData) => void;
    updateTracking: (formData: FormData) => void;
    removeTracking: (formData: FormData) => void;
    actionDone: Actions;
    isLoading: boolean;
}

export function useBookTracking(bookRemoteId: string): BookTrackingStateAndFunc {
    const fetcherTrackingLoader = useFetcher<LoaderData>();
    const fetcherTrackingAction = useFetcher();

    const [tracking, setTracking] = useState<GetBookTrackingResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionDone, setIsActionDone] = useState<Actions>("idle");
    const [actionDoing, setIsActionDoing] = useState<Actions>("idle");

    useEffect(() => {
        fetcherTrackingLoader.submit(null, { action: `/home/books/track/${bookRemoteId}`, method: "get" });
        setIsLoading(true);
    }, []);

    useEffect(() => {
        if (fetcherTrackingLoader.type === "done") {
            setTracking(fetcherTrackingLoader.data.bookTracking);
            setIsLoading(false);
        }
    }, [fetcherTrackingLoader.type]);

    useEffect(() => {
        if (fetcherTrackingAction.type === "done") {
            fetcherTrackingLoader.submit(null, { action: `/home/books/track/${bookRemoteId}`, method: "get" });
            setIsActionDone(actionDoing);
            setIsLoading(true);
        }
    }, [fetcherTrackingAction.type]);

    const addTracking = (formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/books/track/${bookRemoteId}`,
                method: "post"
            }
        );
        setIsActionDoing("add");
        setIsLoading(true);
    };
    
    const updateTracking = (formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/books/track/${bookRemoteId}`,
                method: "put"
            }
        );
        setIsActionDoing("update");
        setIsLoading(true);
    };

    const removeTracking = (formData: FormData) => {
        fetcherTrackingAction.submit(
            formData,
            {
                action: `/home/books/track/${bookRemoteId}`,
                method: "delete"
            }
        );
        setIsActionDoing("remove");
        setIsLoading(true);
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
