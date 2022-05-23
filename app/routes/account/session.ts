import { ActionFunction, json } from "@remix-run/node";
import {
    hasValidAuthInfo,
    removeUserSession,
    requireAuthInfo,
    jsonWithUserSession,
    okWithUserSession
} from "~/utils/session.server";
import { refresh } from "auth";

export const action: ActionFunction = async ({request}) => {
    if (request.method !== "POST") {
        return json({message: "Method not allowed"}, 405);
    }    
    
    let authInfo = await requireAuthInfo(request);

    const isAuthInfoValid = await hasValidAuthInfo(request);
    if (!isAuthInfoValid) {
        const authResult = await refresh(authInfo.refreshToken);

        if (!authResult.authInfo || authResult.error) {
            return await removeUserSession(request);
        }
        
        authInfo = authResult.authInfo;
    }
    
    return await okWithUserSession(authInfo);
}