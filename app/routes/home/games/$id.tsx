import { Badge, Button, Container, Group, MediaQuery, Stack, Text, ThemeIcon, Title, } from "@mantine/core";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
    AddGameTrackingCommand,
    backendAPIClientInstance,
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus,
    GetGameResult,
    GetGameTrackingsItemResult,
    RemoveGameTrackingCommand,
    UpdateGameTrackingCommand,
} from "backend";
import { Edit, Plus, Star } from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import CoverImage from "~/components/home/CoverImage";
import { useModals } from "@mantine/modals";
import { showGameTrackingsSelectorModal, showTrackGameEditorModal } from "~/components/home/games/TrackGameEditorModal";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";

interface LoaderData {
    game: GetGameResult;
    gameTrackings: GetGameTrackingsItemResult[]
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const gameId: number = parseInt(params.id ?? "0");

    const getGameBackendAPIResponse = await backendAPIClientInstance.game_GetGame(gameId);
    const game = getGameBackendAPIResponse.result;

    const userId = await requireUserId(request);

    const getGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetGameTrackings(userId, gameId);

    return json<LoaderData>({
        game: game,
        gameTrackings: getGameTrackingsBackendAPIResponse.result.items ?? []
    });
}

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

    return null;
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

    return null;
}

const handlePut = async (request: Request) => {
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

    return null;
}

export const action: ActionFunction = async ({ request }) => {
    if (request.method === "POST") {
        return handlePost(request);
    } else if (request.method === "DELETE") {
        return handleDelete(request);
    } else if (request.method === "PUT") {
        return handlePut(request);
    } else {
        return json({ message: "Method not allowed" }, 405);
    }
}

interface GameHeaderProps {
    coverImageURL: string | undefined;
    title: string | undefined;
    rating: number | undefined;
    platforms: string[] | undefined;
    companies: string[] | undefined;
    noOfGameTrackings: number;
    onAddClick: () => void;
    onEditClick: () => void;
}

export function GameHeader({
                               coverImageURL,
                               title,
                               rating,
                               platforms,
                               companies,
                               noOfGameTrackings,
                               onAddClick,
                               onEditClick
                           }: GameHeaderProps) {
    return (
        <>
            <Stack mr={12}>
                <CoverImage src={coverImageURL} width={200} height={300}/>

                {(noOfGameTrackings < (platforms?.length ?? 1)) &&
                    <Button color={"indigo"}
                            onClick={onAddClick}
                            leftIcon={<Plus size={20}/>}>
                        Create tracking
                    </Button>}

                {(noOfGameTrackings > 0) &&
                    <Button color={"orange"}
                            onClick={onEditClick}
                            leftIcon={<Edit size={20}/>}>
                        Edit tracking
                    </Button>}
            </Stack>

            <Stack spacing={"xs"}>
                <Title order={1}>
                    {title}
                </Title>

                <Title order={4} sx={(theme) => ({
                    color: theme.colors.gray[6],
                })}>
                    {companies?.join(", ")}
                </Title>

                <Group>
                    <ThemeIcon color={"yellow"}>
                        <Star size={16}/>
                    </ThemeIcon>
                    <Text sx={(theme) => ({ color: theme.colors.gray[6] })} size={"sm"}>
                        {rating === 0 ? "No rating" : `${rating?.toFixed(0)}%`}
                    </Text>
                </Group>

                <Group mt={16}>
                    {platforms?.map(platform => (
                        <Badge color={"gray"} size={"lg"} key={platform}>{platform}</Badge>))}
                </Group>
            </Stack>
        </>
    );
}

export default function Game() {
    const data = useLoaderData<LoaderData>();
    const modals = useModals();
    const submit = useSubmit();

    const gameHeader = <GameHeader coverImageURL={data.game.coverImageURL}
                                   title={data.game.title}
                                   rating={data.game.rating}
                                   platforms={data.game.platforms}
                                   companies={data.game.companies}
                                   noOfGameTrackings={data.gameTrackings.length}
                                   onAddClick={() => showTrackGameEditorModal(
                                       modals,
                                       data.game,
                                       null,
                                       data.gameTrackings,
                                       (formData) => submit(formData, { method: "post", replace: true }),
                                       () => {
                                       },
                                       () => {
                                       }
                                   )}
                                   onEditClick={() => showGameTrackingsSelectorModal(
                                       modals,
                                       data.game,
                                       data.gameTrackings,
                                       (formData) => submit(formData, { method: "post", replace: true }),
                                       (formData) => submit(formData, { method: "put", replace: true }),
                                       (formData) => submit(formData, { method: "delete", replace: true })
                                   )}/>

    return (
        <Container py={16}>
            <MediaQuery styles={{ display: "none" }} largerThan={"sm"}>
                <Stack>
                    {gameHeader}
                </Stack>
            </MediaQuery>

            <MediaQuery styles={{ display: "none" }} smallerThan={"sm"}>
                <Group align={"end"} noWrap>
                    {gameHeader}
                </Group>
            </MediaQuery>

            <Stack mt={48}>
                <Title order={2}>Summary</Title>
                <Text sx={(theme) => ({ color: theme.colors.gray[6] })}>{data.game.summary}</Text>
            </Stack>
        </Container>
    );
}