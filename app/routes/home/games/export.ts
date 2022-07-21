import { LoaderFunction, Response } from "@remix-run/node";
import { backendAPIClientInstance, GameTrackingFormat, GameTrackingOwnership, GameTrackingStatus, GetAllGameTrackingsItemResult } from "backend";
import { requireUserId } from "~/utils/session.server";

//#region Server
export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);

    let page = 1;
    let totalPages = 1;

    const gameTrackings: GetAllGameTrackingsItemResult[] = [];
    
    do {
        const getGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetAllGameTrackings(
            userId,
            null,
            true,
            false,
            false,
            false,
            false,
            page,
            5
        );
        
        gameTrackings.push(...getGameTrackingsBackendAPIResponse.result.items);

        page++;
        totalPages = getGameTrackingsBackendAPIResponse.result.totalPages;
    } while (page <= totalPages)

    const csvHeader = "gameRemoteId, title, hoursPlayed, platform, format, status, ownership"

    const csvTrackingsArray = gameTrackings.map(gt => {
        const obj = gt.toJSON();
        const csvArray = [];
        for (const key in obj) {
            const value = obj[key];
            let exportedValue = value;

            if (key === "format") {
                exportedValue = `${GameTrackingFormat[value]}`
            } else if (key === "status") {
                exportedValue = `${GameTrackingStatus[value]}`
            } else if (key === "ownership") {
                exportedValue = `${GameTrackingOwnership[value]}`
            } else if (key === "coverImageURL") {
                continue;
            } 

            csvArray.push(`${exportedValue}`);
        }
        return csvArray.join(", ");
    });


    return new Response([csvHeader].concat(csvTrackingsArray).join("\n"));
}
//#endregion Server
