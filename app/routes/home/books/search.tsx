import { Card, Text, Container, Group, Stack, Title } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { backendAPIClientInstance, SearchBooksItemResult } from "backend";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import CoverImage from "~/components/home/CoverImage";

//region Server

interface LoaderData {
    items: SearchBooksItemResult[]
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const title = url.searchParams.get("title");

    const backendResult = await backendAPIClientInstance.book_SearchBooks(title);

    return json<LoaderData>({
        items: backendResult.result.items ?? []
    });
}

//endregion

//region Client

interface SearchResultItemProps {
    id: string;
    title: string;
    coverImageURL: string | undefined;
    authors: string[];
}

function SearchResultItem({ id, title, coverImageURL, authors }: SearchResultItemProps) {
    return (
        <div style={{ width: "100%", margin: 'auto' }}>
            <Link to={`/home/books/${id}`} style={{ textDecoration: "none" }}>
                <Card shadow="xs" p="lg">
                    <Group align={"end"}>
                        <CoverImage src={coverImageURL} width={100} height={150}/>

                        <Stack ml={8}>
                            <Title order={3}>{title}</Title>
                            <Text>
                                {authors.join(", ")}
                            </Text>
                        </Stack>
                    </Group>
                </Card>
            </Link>
        </div>
    );
}

export default function Search() {
    const loaderData = useLoaderData<LoaderData>();
    const [searchParams, _] = useSearchParams();
    const title = searchParams.get("title");

    return (
        <Container py={16}>
            <Title mb={32} order={2}>Search results for "{title}"</Title>
            <Stack>
                {loaderData.items.map(b => (
                    <SearchResultItem key={b.remoteId ?? ""}
                                      id={b.remoteId ?? ""}
                                      title={b.title ?? ""}
                                      coverImageURL={b.coverImageURL}
                                      authors={b.authors ?? []}
                    />
                ))}
            </Stack>
        </Container>
    );
}

//endregion
