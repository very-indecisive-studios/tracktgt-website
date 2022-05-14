import { ActionFunction, json, redirect } from "@remix-run/node";
import {
    backendAPIClientInstance,
    AddGameTrackingCommand,
    RemoveGameTrackingCommand,
    UpdateGameTrackingCommand,
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus
} from "backend";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { requireUserId } from "~/utils/session.server";

const handleDelete = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            gameRemoteId: z.preprocess(preProcessToNumber, z.number()),
            platform: z.string(),
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.game_RemoveGameTracking(new RemoveGameTrackingCommand({
        gameRemoteId: parsedFormData.data.gameRemoteId,
        userRemoteId: userId,
        platform: parsedFormData.data.platform
    }));

    return redirect(`/home/games/${parsedFormData.data.gameRemoteId}`);
}

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    const gameStatusesLength = Object.keys(GameTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .length;

    const gameFormatsLength = Object.keys(GameTrackingFormat)
        .filter((s) => isNaN(Number(s)))
        .length;

    const gameOwnershipsLength = Object.keys(GameTrackingOwnership)
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
    
    return formDataSchema.safeParse(formData);
}

const handlePost = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.game_AddGameTracking(new AddGameTrackingCommand({
        gameRemoteId: parsedFormData.data.gameRemoteId,
        userRemoteId: userId,
        hoursPlayed: parsedFormData.data.hoursPlayed,
        platform: parsedFormData.data.platform,
        ownership: parsedFormData.data.ownership,
        format: parsedFormData.data.format,
        status: parsedFormData.data.status,
    }));

    return redirect(`/home/games/${parsedFormData.data.gameRemoteId}`);
}

export const handlePut = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }
    
    await backendAPIClientInstance.game_UpdateGameTracking(new UpdateGameTrackingCommand({
        gameRemoteId: parsedFormData.data.gameRemoteId,
        userRemoteId: userId,
        hoursPlayed: parsedFormData.data.hoursPlayed,
        platform: parsedFormData.data.platform,
        ownership: parsedFormData.data.ownership,
        format: parsedFormData.data.format,
        status: parsedFormData.data.status,
    }));
    
    return redirect(`/home/games/${parsedFormData.data.gameRemoteId}`);
}

export const action: ActionFunction = async ({ request }) => {
    if (request.method === "POST") {
        return handlePost(request)
    } else if (request.method === "DELETE") {
        return handleDelete(request)
    } else if (request.method === "PUT") {
        return handlePut(request)
    } else {
        return json({message: "Method not allowed"}, 405);
    }
}