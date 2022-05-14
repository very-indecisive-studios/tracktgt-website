import { ActionFunction, json, redirect } from "@remix-run/node";
import {
    AddTrackedGameCommand,
    backendAPIClientInstance,
    BackendAPIException, RemoveTrackedGameCommand,
    TrackedGameFormat,
    TrackedGameOwnership,
    TrackedGameStatus
} from "backend";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { requireUserId } from "~/utils/session.server";

export const handleDelete = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            gameRemoteId: z.preprocess(preProcessToNumber, z.number())
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.game_RemoveTrackedGame(new RemoveTrackedGameCommand({
        gameRemoteId: parsedFormData.data.gameRemoteId,
        userRemoteId: userId,
    }));

    return redirect(`/home/games/${parsedFormData.data.gameRemoteId}`);
}

export const handlePost = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const gameStatusesLength = Object.keys(TrackedGameStatus)
        .filter((s) => isNaN(Number(s)))
        .length;

    const gameFormatsLength = Object.keys(TrackedGameFormat)
        .filter((s) => isNaN(Number(s)))
        .length;

    const gameOwnershipsLength = Object.keys(TrackedGameOwnership)
        .filter((s) => isNaN(Number(s)))
        .length;

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            gameRemoteId: z.preprocess(preProcessToNumber, z.number()),
            hoursPlayed: z.preprocess(preProcessToNumber, z.number().gte(0)),
            platform: z.string(),
            status: z.preprocess(preProcessToNumber, z.number().min(0).max(gameStatusesLength - 1)),
            format: z.preprocess(preProcessToNumber, z.number().min(0).max(gameFormatsLength - 1)),
            ownership: z.preprocess(preProcessToNumber, z.number().min(0).max(gameOwnershipsLength - 1))
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    try {
        await backendAPIClientInstance.game_AddTrackedGame(new AddTrackedGameCommand({
            gameRemoteId: parsedFormData.data.gameRemoteId,
            userRemoteId: userId,
            hoursPlayed: parsedFormData.data.hoursPlayed,
            platform: parsedFormData.data.platform,
            ownership: parsedFormData.data.ownership,
            format: parsedFormData.data.format,
            status: parsedFormData.data.status,
        }));
    } catch(err) {
        const backendError = err as BackendAPIException

        throw backendError;
    }

    return redirect(`/home/games/${parsedFormData.data.gameRemoteId}`);
}


export const action: ActionFunction = async ({ request }) => {
    if (request.method === "POST") {
        return handlePost(request)
    } else if (request.method === "DELETE") {
        return handleDelete(request)
    } else {
        return json({message: "Method not allowed"}, 405);
    }
}