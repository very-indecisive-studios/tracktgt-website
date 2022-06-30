import {
    backendAPIClientInstance,
    GetUserFollowingsItemResult
} from "backend";
import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

//region Server

interface LoaderData {
    followings: GetUserFollowingsItemResult[]
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);

    const userId = params.userId ?? "";

    const backendAPIResponse = await backendAPIClientInstance.user_GetUserFollowings(userId);

    return json<LoaderData>({
        followings: backendAPIResponse.result.items
    });
}

//endregion

//region Client

interface UserFollowingsListStateAndFunc {
    followings: GetUserFollowingsItemResult[];
    refresh: () => void;
    isLoading: boolean;
    setUserId: (userId: string) => void;
}

export function useUserFollowingsList(targetUserId: string): UserFollowingsListStateAndFunc {
    const [userId, setUserId] = useState(targetUserId);

    const fetcherUserFollowingsListLoader = useFetcher<LoaderData>();
    
    const [followings, setFollowings] = useState<GetUserFollowingsItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        fetcherUserFollowingsListLoader.submit(null, { action: `/home/members/followings/${userId}`, method: "get" });
        setIsLoading(true);
    }, [userId]);
    
    useEffect(() => {
        if (fetcherUserFollowingsListLoader.type === "done") {
            setFollowings(fetcherUserFollowingsListLoader.data.followings);
            setIsLoading(false);
        }
    }, [fetcherUserFollowingsListLoader.type]);
    
    const refresh = () => {
        fetcherUserFollowingsListLoader.submit(null, { action: `/home/members/followings/${userId}`, method: "get" });

        setIsLoading(true);
    };
    
    return {
        followings,
        refresh,
        isLoading,
        setUserId
    }
}

//endregion
