import { json, LoaderFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { requireUserId } from "~/utils/session.server";
import { badRequest } from "~/utils/response.server";
import {
    backendAPIClientInstance,
    GameTrackingStatus,
    GetAllGameTrackingsItemResult,
} from "backend";

//region Server

interface LoaderData {
    gameTrackings: GetAllGameTrackingsItemResult[],
    currentPage: number;
    totalPages: number;
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

    const getGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetAllGameTrackings(
        userId,
        GameTrackingStatus[parsedQueryData.data.status as keyof typeof GameTrackingStatus],
        true,
        false,
        false,
        false,
        false,
        parsedQueryData.data.page,
        5
    );

    return json<LoaderData>({
        gameTrackings: getGameTrackingsBackendAPIResponse.result.items,
        currentPage: getGameTrackingsBackendAPIResponse.result.page,
        totalPages: getGameTrackingsBackendAPIResponse.result.totalPages
    });
}

//endregion

//region Client

interface AllGameTrackingsStateAndFunc {
    allTrackings: GetAllGameTrackingsItemResult[];
    currentPage: number;
    totalPages: number;
    fetchPage: (page: number) => void;
    isLoading: boolean;
}

export function useAllGamesTrackings(userId: string, status: GameTrackingStatus, initialPage?: number): AllGameTrackingsStateAndFunc {
    const fetcherAllTrackingsLoader = useFetcher<LoaderData>();

    const [currentPage, setCurrentPage] = useState(initialPage ?? 1);
    const [totalPages, setTotalPages] = useState(1);
    const [allTrackings, setAllTrackings] = useState<GetAllGameTrackingsItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetcherAllTrackingsLoader.submit(
            null,
            {
                action: `/home/games/track/all/${userId}?status=${GameTrackingStatus[status]}&page=${currentPage}`,
                method: "get"
            }
        );
        setIsLoading(true);
    }, []);

    useEffect(() => {
        if (fetcherAllTrackingsLoader.type === "done") {
            setAllTrackings(fetcherAllTrackingsLoader.data.gameTrackings);
            setTotalPages(fetcherAllTrackingsLoader.data.totalPages);
            setCurrentPage(fetcherAllTrackingsLoader.data.currentPage);
            setIsLoading(false);
        }
    }, [fetcherAllTrackingsLoader.type]);

    const fetchPage = (page: number) => {
        fetcherAllTrackingsLoader.submit(
            null,
            {
                action: `/home/games/track/all/${userId}?status=${GameTrackingStatus[status]}&page=${page}`,
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
