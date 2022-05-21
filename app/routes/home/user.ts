import { json, LoaderFunction } from "@remix-run/node";
import { backendAPIClientInstance, GetUserResult } from "backend";
import { requireUserId } from "~/utils/session.server";

export interface UserLoaderData {
    user: GetUserResult;
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    
    const getUserBackendAPIResponse = await backendAPIClientInstance.user_GetUser(userId);
    
    return json<UserLoaderData>({
       user: getUserBackendAPIResponse.result 
    });
}
