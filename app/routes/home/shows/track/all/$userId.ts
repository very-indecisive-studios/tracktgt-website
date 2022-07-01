import { json, LoaderFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { requireUserId } from "~/utils/session.server";
import { badRequest } from "~/utils/response.server";
import {
    backendAPIClientInstance,
    GetAllShowTrackingsItemResult,
    ShowTrackingStatus
} from "backend";

//region Server

interface LoaderData {
    showTrackings: GetAllShowTrackingsItemResult[],
    currentPage: number,
    totalPages: number
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);

    const userId = params.userId ?? "";

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

    const getAllShowTrackingResponse = await backendAPIClientInstance.show_GetAllShowTrackings(
        userId,
        ShowTrackingStatus[parsedQueryData.data.status as keyof typeof ShowTrackingStatus],
        true,
        false,
        parsedQueryData.data.page,
        5
    );

    return json<LoaderData>({
        showTrackings: getAllShowTrackingResponse.result.items,
        currentPage: getAllShowTrackingResponse.result.page,
        totalPages: getAllShowTrackingResponse.result.totalPages
    });
}

//endregion

//region Client

interface AllShowTrackingsStateAndFunc {
    allTrackings: GetAllShowTrackingsItemResult[];
    currentPage: number;
    totalPages: number;
    fetchPage: (page: number) => void;
    isLoading: boolean;
    setUserId: (userId: string) => void;
}

export function useAllShowsTrackings(targetUserId: string, status: ShowTrackingStatus, initialPage?: number): AllShowTrackingsStateAndFunc {
    const [userId, setUserId] = useState(targetUserId);

    const fetcherAllTrackingsLoader = useFetcher<LoaderData>();

    const [currentPage, setCurrentPage] = useState(initialPage ?? 1);
    const [totalPages, setTotalPages] = useState(1);
    const [allTrackings, setAllTrackings] = useState<GetAllShowTrackingsItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetcherAllTrackingsLoader.submit(
            null,
            {
                action: `/home/shows/track/all/${userId}?status=${ShowTrackingStatus[status]}&page=${currentPage}`,
                method: "get"
            }
        );
        setIsLoading(true);
    }, [userId]);

    useEffect(() => {
        if (fetcherAllTrackingsLoader.type === "done") {
            setAllTrackings(fetcherAllTrackingsLoader.data.showTrackings);
            setTotalPages(fetcherAllTrackingsLoader.data.totalPages);
            setCurrentPage(fetcherAllTrackingsLoader.data.currentPage);
            setIsLoading(false);
        }
    }, [fetcherAllTrackingsLoader.type]);

    const fetchPage = (page: number) => {
        fetcherAllTrackingsLoader.submit(
            null,
            {
                action: `/home/shows/track/all/${userId}?status=${ShowTrackingStatus[status]}&page=${page}`,
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
        isLoading,
        setUserId
    }
}

//endregion
