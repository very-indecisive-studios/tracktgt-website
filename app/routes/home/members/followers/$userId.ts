import {
    backendAPIClientInstance,
    GetUserFollowersItemResult
} from "backend";
import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

//region Server

interface LoaderData {
    followers: GetUserFollowersItemResult[]
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);

    const userId = params.userId ?? "";

    const backendAPIResponse = await backendAPIClientInstance.user_GetUserFollowers(userId);

    return json<LoaderData>({
        followers: backendAPIResponse.result.items
    });
}

//endregion

//region Client

interface UserFollowersListStateAndFunc {
    followers: GetUserFollowersItemResult[];
    refresh: () => void;
    isLoading: boolean;
    setUserId: (userId: string) => void;
}

export function useUserFollowersList(targetUserId: string): UserFollowersListStateAndFunc {
    const [userId, setUserId] = useState(targetUserId);

    const fetcherUserFollowersListLoader = useFetcher<LoaderData>();
    
    const [followers, setFollowers] = useState<GetUserFollowersItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        fetcherUserFollowersListLoader.submit(null, { action: `/home/members/followers/${userId}`, method: "get" });
        setIsLoading(true);
    }, [userId]);
    
    useEffect(() => {
        if (fetcherUserFollowersListLoader.type === "done") {
            setFollowers(fetcherUserFollowersListLoader.data.followers);
            setIsLoading(false);
        }
    }, [fetcherUserFollowersListLoader.type]);
    
    const refresh = () => {
        fetcherUserFollowersListLoader.submit(null, { action: `/home/members/followers/${userId}`, method: "get" });

        setIsLoading(true);
    };
    
    return {
        followers,
        refresh,
        isLoading,
        setUserId
    }
}

//endregion
