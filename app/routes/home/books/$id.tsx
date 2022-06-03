import { Button, Container, Group, MediaQuery, Stack, Text, Title, } from "@mantine/core";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
    AddBookTrackingCommand,
    backendAPIClientInstance,
    BookTrackingFormat,
    BookTrackingOwnership,
    BookTrackingStatus,
    GetBookResult,
    GetBookTrackingResult,
    RemoveBookTrackingCommand,
    UpdateBookTrackingCommand,
} from "backend";
import { requireUserId } from "~/utils/session.server";
import CoverImage from "~/components/home/CoverImage";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { Edit, Plus } from "tabler-icons-react";
import { showTrackBookEditorModal } from "~/components/home/books/TrackBookEditorModal";
import { useModals } from "@mantine/modals";

interface LoaderData {
    book: GetBookResult;
    bookTracking: GetBookTrackingResult | null;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const bookId: string = params.id ?? "0";

    const getBookResponse = await backendAPIClientInstance.book_GetBook(bookId);
    const book = getBookResponse.result;

    const userId = await requireUserId(request);

    const getBookTrackingResponse = await backendAPIClientInstance.book_GetBookTracking(userId, bookId);

    return json<LoaderData>({
        book: book,
        bookTracking: getBookTrackingResponse.result
    });
}

const handleDelete = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    // Validate form.
    const formDataSchema = z
        .object({
            bookRemoteId: z.string(),
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.book_RemoveBookTracking(new RemoveBookTrackingCommand({
        bookRemoteId: parsedFormData.data.bookRemoteId,
        userRemoteId: userId
    }));

    return null;
}

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    const bookStatusesLength = Object.keys(BookTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .length;

    const bookFormatsLength = Object.keys(BookTrackingFormat)
        .filter((s) => isNaN(Number(s)))
        .length;

    const bookOwnershipsLength = Object.keys(BookTrackingOwnership)
        .filter((s) => isNaN(Number(s)))
        .length;

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            bookRemoteId: z.string(),
            chaptersRead: z.preprocess(preProcessToNumber, z.number().gte(0)),
            status: z.preprocess(preProcessToNumber, z.number().min(0).max(bookStatusesLength - 1)),
            format: z.preprocess(preProcessToNumber, z.number().min(0).max(bookFormatsLength - 1)),
            ownership: z.preprocess(preProcessToNumber, z.number().min(0).max(bookOwnershipsLength - 1))
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

    await backendAPIClientInstance.book_AddBookTracking(new AddBookTrackingCommand({
        bookRemoteId: parsedFormData.data.bookRemoteId,
        userRemoteId: userId,
        chaptersRead: parsedFormData.data.chaptersRead,
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

    await backendAPIClientInstance.book_UpdateBookTracking(new UpdateBookTrackingCommand({
        bookRemoteId: parsedFormData.data.bookRemoteId,
        userRemoteId: userId,
        chaptersRead: parsedFormData.data.chaptersRead,
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

interface BookHeaderProps {
    coverImageURL: string | undefined;
    title: string | undefined;
    authors: string[] | undefined;
    hasGameTracking: boolean;
    onAddClick: () => void;
    onEditClick: () => void;
}

export function BookHeader({
                               coverImageURL,
                               title,
                               authors, 
                               hasGameTracking, 
                               onAddClick, 
                               onEditClick
                           }: BookHeaderProps) {
    return (
        <>
            <Stack mr={12}>
                <CoverImage src={coverImageURL} width={200} height={300}/>

                {!hasGameTracking &&
                    <Button color={"indigo"}
                            onClick={onAddClick}
                            leftIcon={<Plus size={20}/>}>
                        Create tracking
                    </Button>}

                {hasGameTracking &&
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
                    {authors?.join(", ")}
                </Title>
            </Stack>
        </>
    );
}

export default function Book() {
    const loaderData = useLoaderData<LoaderData>();
    const modals = useModals();
    const submit = useSubmit();

    const bookHeader = <BookHeader coverImageURL={loaderData.book.coverImageURL}
                                   title={loaderData.book.title}
                                   authors={loaderData.book.authors}
                                   hasGameTracking={!!loaderData.bookTracking}
                                   onAddClick={() => showTrackBookEditorModal(
                                       modals,
                                       loaderData.book,
                                       null,
                                       (formData) => submit(formData, { method: "post", replace: true }),
                                       () => { },
                                       () => { }
                                   )}
                                   onEditClick={() => showTrackBookEditorModal(
                                       modals,
                                       loaderData.book,
                                       loaderData.bookTracking,
                                       () => { },
                                       (formData) => submit(formData, { method: "put", replace: true }),
                                       (formData) => submit(formData, { method: "delete", replace: true })
                                   )}/>

    return (
        <Container py={16}>
            <MediaQuery styles={{ display: "none" }} largerThan={"sm"}>
                <Stack>
                    {bookHeader}
                </Stack>
            </MediaQuery>

            <MediaQuery styles={{ display: "none" }} smallerThan={"sm"}>
                <Group align={"end"} noWrap>
                    {bookHeader}
                </Group>
            </MediaQuery>

            <Stack mt={48}>
                <Title order={2}>Summary</Title>
                <Text
                    sx={(theme) => ({ color: theme.colors.gray[6] })}>{loaderData.book.summary?.replace(/<\/?[^>]+(>|$)/g, "")}</Text>
            </Stack>
        </Container>
    );
}