import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { requireUserId } from "~/utils/session.server";
import {
    backendAPIClientInstance,
    FollowUserCommand,
    UnfollowUserCommand
} from "backend";

//region Server

interface LoaderData {
    isFollowing: boolean;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const userId = await requireUserId(request);
    const targetUserId = params.targetUserId ?? "";

    const checkFollowingResponse = await backendAPIClientInstance.user_CheckUserFollowing(
        userId,
        targetUserId
    )

    return json<LoaderData>({
        isFollowing: checkFollowingResponse.result.isFollowing
    });
}

const handleDelete = async (targetUserId: string, request: Request) => {
    const userId = await requireUserId(request);
    
    backendAPIClientInstance.user_UnfollowUser(new UnfollowUserCommand({
        followerUserId: userId,
        followingUserId: targetUserId
    }));

    return null;
}

const handlePost = async (targetUserId: string, request: Request) => {
    const userId = await requireUserId(request);

    backendAPIClientInstance.user_FollowUser(new FollowUserCommand({
        followerUserId: userId,
        followingUserId: targetUserId
    }));

    return null;
}

export const action: ActionFunction = async ({ params, request }) => {
    const targetUserId = params.targetUserId ?? "";
    
    if (request.method === "POST") {
        return handlePost(targetUserId, request);
    } else if (request.method === "DELETE") {
        return handleDelete(targetUserId, request);
    } else {
        return json({ message: "Method not allowed" }, 405);
    }
}

//endregion

//region Client

type Actions = "idle" | "add" | "update" | "remove";

interface UserFollowActionsAndStateFunc {
    isFollowing: boolean;
    followUser: () => void;
    unfollowUser: () => void;
    actionDone: Actions;
    isLoading: boolean;
    setUserId: (userId: string) => void;
}

export function useUserFollow(targetUserId: string): UserFollowActionsAndStateFunc {
    const [userId, setUserId] = useState(targetUserId);

    const fetcherFollowLoader = useFetcher<LoaderData>();
    const fetcherFollowAction = useFetcher();

    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [actionDone, setIsActionDone] = useState<Actions>("idle");
    const [actionDoing, setIsActionDoing] = useState<Actions>("idle");

    useEffect(() => {
        fetcherFollowLoader.submit(null, { action: `/home/members/follow/${userId}`, method: "get" });
        setIsLoading(true);
    }, [userId]);

    useEffect(() => {
        if (fetcherFollowLoader.type === "done") {
            setIsFollowing(fetcherFollowLoader.data.isFollowing);
            setIsLoading(false);
        }
    }, [fetcherFollowLoader.type]);

    useEffect(() => {
        if (fetcherFollowAction.type === "done") {
            fetcherFollowLoader.submit(null, { action: `/home/members/follow/${userId}`, method: "get" });
            setIsLoading(true);
            setIsActionDone(actionDoing);
        }
    }, [fetcherFollowAction.type]);
    
    const followUser = () => {
        fetcherFollowAction.submit(
            null,
            {
                action: `/home/members/follow/${userId}`,
                method: "post"
            });

        setIsActionDoing("add");
        setIsLoading(true);
    };

    const unfollowUser = () => {
        fetcherFollowAction.submit(
            null,
            {
                action: `/home/members/follow/${userId}`,
                method: "delete"
            });
        
        setIsActionDoing("remove");
        setIsLoading(true);
    };

    return {
        isFollowing,
        followUser,
        unfollowUser,
        actionDone,
        isLoading,
        setUserId
    }
}

//endregion
