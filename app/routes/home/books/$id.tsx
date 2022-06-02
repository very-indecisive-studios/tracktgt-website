import { Container, Group, MediaQuery, Stack, Text, ThemeIcon, Title, } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    backendAPIClientInstance,
    GetBookResult
} from "backend";
import { requireUserId } from "~/utils/session.server";
import CoverImage from "~/components/home/CoverImage";

interface LoaderData {
    book: GetBookResult;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const bookId: string = params.id ?? "0";

    const backendAPIResponse = await backendAPIClientInstance.book_GetBook(bookId);
    const book = backendAPIResponse.result;

    const userId = await requireUserId(request);

    return json<LoaderData>({
        book: book,
    });
}

interface BookHeaderProps {
    coverImageURL: string | undefined;
    title: string | undefined;
    authors: string[] | undefined;
}

export function BookHeader({
   coverImageURL,
   title,
   authors,
}: BookHeaderProps) {
    return (
        <>
            <Stack mr={12}>
                <CoverImage src={coverImageURL} width={200} height={300}/>
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

    const bookHeader = <BookHeader coverImageURL={loaderData.book.coverImageURL}
                                   title={loaderData.book.title}
                                   authors={loaderData.book.authors} />

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
                <Text sx={(theme) => ({ color: theme.colors.gray[6] })}>{loaderData.book.summary?.replace(/<\/?[^>]+(>|$)/g, "")}</Text>
            </Stack>
        </Container>
    );
}