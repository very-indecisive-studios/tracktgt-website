import { ActionFunction, json } from "@remix-run/node";
import { getAuthInfo, setUserSession } from "~/utils/session.server";
import dayjs from "dayjs";
import { refreshIdToken } from "auth";

export const action: ActionFunction = async ({request}) => {
    if (request.method !== "POST") {
        return json({message: "Method not allowed"}, 405);
    }    
    
    const authInfo = await getAuthInfo(request);
    
    if (dayjs(authInfo.expiresAt).isAfter(dayjs())) {
        const authResult = await refreshIdToken(authInfo.refreshToken);
        
        if (!authResult.authInfo || authResult.error) {
            return null;
        }
        
        return await setUserSession(authResult.authInfo);
    }
    
    return null;
}