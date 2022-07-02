import { json, LoaderFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { backendAPIClientInstance, GetUserActivitiesItemResult } from "backend";
import { useEffect, useState } from "react";
import { requireUserId } from "~/utils/session.server";

//#region Server

interface LoaderData {
    activities: GetUserActivitiesItemResult[];
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);

    const userId = params.userId ?? "";

    const getUserActivitiesResponse = await backendAPIClientInstance.user_GetUserActivities(userId);

    return json<LoaderData>({
        activities: getUserActivitiesResponse.result.items
    });
}

//#endregion

//#region Client

interface UserActivitiesStateAndFunc {
    activities: GetUserActivitiesItemResult[];
    refresh: () => void;
    isLoading: boolean;
    setUserId: (userId: string) => void;
}

export function useUserActivities(targetUserId: string): UserActivitiesStateAndFunc {
    const [userId, setUserId] = useState(targetUserId);

    const fetcherUserActivitiesLoader = useFetcher<LoaderData>();

    const [activities, setActivities] = useState<GetUserActivitiesItemResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetcherUserActivitiesLoader.submit(null, { action: `/home/members/activity/${userId}`, method: "get" });
        setIsLoading(true);
    }, [userId]);
    
    useEffect(() => {
        if (fetcherUserActivitiesLoader.type === "done") {
            setActivities(fetcherUserActivitiesLoader.data.activities);
            setIsLoading(false);
        }
    }, [fetcherUserActivitiesLoader.type]);
    
    const refresh = () => {
        fetcherUserActivitiesLoader.submit(null, { action: `/home/members/activity/${userId}`, method: "get" });

        setIsLoading(true);
    };
    
    return {
        activities,
        refresh,
        isLoading,
        setUserId
    };
}

//#endregion