import {
    backendAPIClientInstance,
    BookTrackingStatus,
    GetAllBookTrackingsItemResult,
} from "backend";
import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

//region Server

interface LoaderData {
    bookTrackings: GetAllBookTrackingsItemResult[],
    currentPage: number;
    totalPages: number;
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);

    let url = new URL(request.url);
    let queryData = {
        page: url.searchParams.get("page"),
        status: url.searchParams.get("status")
    }

    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            page: z.preprocess(preProcessToNumber, z.number()),
            status: z.string()
        });

    const parsedQueryData = formDataSchema.safeParse(queryData);

    if (!parsedQueryData.success) {
        return badRequest(parsedQueryData.error.flatten().fieldErrors);
    }

    const getAllBookTrackingResponse = await backendAPIClientInstance.book_GetAllBookTrackings(
        userId,
        BookTrackingStatus[parsedQueryData.data.status as keyof typeof BookTrackingStatus],
        true,
        false,
        false,
        false,
        parsedQueryData.data.page,
        5
    );

    return json<LoaderData>({
        bookTrackings: getAllBookTrackingResponse.result.items ?? [],
        currentPage: getAllBookTrackingResponse.result.page ?? 1,
        totalPages: getAllBookTrackingResponse.result.totalPages ?? 0
    });
}

//endregion

//region Client

interface AllBookTrackingsStateAndFunc {
    allTrackings: GetAllBookTrackingsItemResult[];
    currentPage: number;
    totalPages: number;
    fetchPage: (page: number) => void;
    isLoading: boolean;
}

export function useAllBooksTrackings(status: BookTrackingStatus, initialPage?: number): AllBookTrackingsStateAndFunc {
    const fetcherAllTrackingsLoader = useFetcher<LoaderData>();

    const [currentPage, setCurrentPage] = useState(initialPage ?? 1);
    const [totalPages, setTotalPages] = useState(1);
    const [allTrackings, setAllTrackings] = useState<GetAllBookTrackingsItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetcherAllTrackingsLoader.submit(
            null, 
            { 
                action: `/home/books/track?index&status=${BookTrackingStatus[status]}&page=${currentPage}`, 
                method: "get" 
            }
        );
        setIsLoading(true);
    }, []);

    useEffect(() => {
        if (fetcherAllTrackingsLoader.type === "done") {
            setAllTrackings(fetcherAllTrackingsLoader.data.bookTrackings);
            setTotalPages(fetcherAllTrackingsLoader.data.totalPages);
            setCurrentPage(fetcherAllTrackingsLoader.data.currentPage);
            setIsLoading(false);
        }
    }, [fetcherAllTrackingsLoader.type]);

    const fetchPage = (page: number) => {
        fetcherAllTrackingsLoader.submit(
            null,
            {
                action: `/home/books/track?index&status=${BookTrackingStatus[status]}&page=${page}`,
                method: "get"
            }
        );
        setIsLoading(true);
    };

    return {
        allTrackings,
        currentPage,
        totalPages,
        fetchPage,
        isLoading
    }
}

//endregion
