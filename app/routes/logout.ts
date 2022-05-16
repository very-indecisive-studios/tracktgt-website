import { ActionFunction, json } from "@remix-run/node";
import { endUserSession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({message: "Method not allowed"}, 405);
    }
    
    return await endUserSession(request);
}
