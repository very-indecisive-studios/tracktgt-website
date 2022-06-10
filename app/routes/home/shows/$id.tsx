import {Button, Container, Group, MediaQuery, Stack, Text, Title,} from "@mantine/core";
import {ActionFunction, json, LoaderFunction} from "@remix-run/node";
import {useLoaderData, useSubmit} from "@remix-run/react";
import {
    AddShowTrackingCommand,
    backendAPIClientInstance,
    GetShowResult,
    GetShowTrackingResult,
    RemoveShowTrackingCommand,
    ShowTrackingStatus,
    ShowType,
    UpdateShowTrackingCommand
} from "backend";
import {requireUserId} from "~/utils/session.server";
import CoverImage from "~/components/home/CoverImage";
import {z} from "zod";
import {badRequest} from "~/utils/response.server";
import {Edit, Plus} from "tabler-icons-react";
import {showTrackShowEditorModal} from "~/components/home/shows/TrackShowEditorModal";
import {useModals} from "@mantine/modals";

interface LoaderData {
    show: GetShowResult;
    showTracking: GetShowTrackingResult | null;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const showId = params.id ?? "0";
    
    const getShowResponse = await backendAPIClientInstance.show_GetShow(showId);
    
    const show = getShowResponse.result;

    const userId = await requireUserId(request);

    const getShowTrackingResponse = await backendAPIClientInstance.show_GetShowTracking(userId, showId);

    return json<LoaderData>({
        show: show,
        showTracking: getShowTrackingResponse.result
    });
}

const handleDelete = async (request: Request) => {
    const userId = await requireUserId(request);

    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    let formData = Object.fromEntries(await request.formData())
    // Validate form.
    const formDataSchema = z
        .object({
            showRemoteId: z.string()
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }
    
    await backendAPIClientInstance.show_RemoveShowTracking(new RemoveShowTrackingCommand({
        showRemoteId: parsedFormData.data.showRemoteId,
        userRemoteId: userId
    }));

    return null;
}

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    const showStatusesLength = Object.keys(ShowTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .length;

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            showRemoteId: z.string(),
            episodesWatched: z.preprocess(preProcessToNumber, z.number().gte(0)),
            status: z.preprocess(preProcessToNumber, z.number().min(0).max(showStatusesLength - 1))
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

    await backendAPIClientInstance.show_AddShowTracking(new AddShowTrackingCommand({
        showRemoteId: parsedFormData.data.showRemoteId,
        userRemoteId: userId,
        episodesWatched: parsedFormData.data.episodesWatched,
        status: parsedFormData.data.status
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

    await backendAPIClientInstance.show_UpdateShowTracking(new UpdateShowTrackingCommand({
        showRemoteId: parsedFormData.data.showRemoteId,
        userRemoteId: userId,
        episodesWatched: parsedFormData.data.episodesWatched,
        status: parsedFormData.data.status
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

interface ShowHeaderProps {
    coverImageURL: string | undefined;
    title: string | undefined;
    showType: ShowType | undefined;
    hasShowTracking: boolean;
    onAddClick: () => void;
    onEditClick: () => void;
}

export function ShowHeader({
                               coverImageURL,
                               title,
                               showType,
                               hasShowTracking, 
                               onAddClick, 
                               onEditClick
                           }: ShowHeaderProps) {
    // @ts-ignore
    // @ts-ignore
    return (
        <>
            <Stack mr={12}>
                <CoverImage src={coverImageURL} width={200} height={300}/>

                {!hasShowTracking &&
                    <Button color={"indigo"}
                            onClick={onAddClick}
                            leftIcon={<Plus size={20}/>}>
                        Create tracking
                    </Button>}

                {hasShowTracking &&
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
                    {(ShowType[showType!!])}
                </Title>
            </Stack>
        </>
    );
}

export default function Show() {
    const loaderData = useLoaderData<LoaderData>();
    const modals = useModals();
    const submit = useSubmit();

    const showHeader = <ShowHeader coverImageURL={loaderData.show.coverImageURL}
                                   title={loaderData.show.title}
                                   showType={loaderData.show.showType}
                                   hasShowTracking={!!loaderData.showTracking}
                                   onAddClick={() => showTrackShowEditorModal(
                                       modals,
                                       loaderData.show,
                                       null,
                                       (formData) => submit(formData, { method: "post", replace: true }),
                                       () => { },
                                       () => { }
                                   )}
                                   onEditClick={() => showTrackShowEditorModal(
                                       modals,
                                       loaderData.show,
                                       loaderData.showTracking,
                                       () => { },
                                       (formData) => submit(formData, { method: "put", replace: true }),
                                       (formData) => submit(formData, { method: "delete", replace: true })
                                   )}/>

    return (
        <Container py={16}>
            <MediaQuery styles={{ display: "none" }} largerThan={"sm"}>
                <Stack>
                    {showHeader}
                </Stack>
            </MediaQuery>

            <MediaQuery styles={{ display: "none" }} smallerThan={"sm"}>
                <Group align={"end"} noWrap>
                    {showHeader}
                </Group>
            </MediaQuery>

            <Stack mt={48}>
                <Title order={2}>Summary</Title>
                <Text
                    sx={(theme) => ({ color: theme.colors.gray[6] })}>{loaderData.show.summary?.replace(/<\/?[^>]+(>|$)/g, "")}</Text>
            </Stack>
        </Container>
    );
}