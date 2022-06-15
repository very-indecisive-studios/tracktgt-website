import {Card, Container, Group, Stack, Text, Title} from "@mantine/core";
import {json, LoaderFunction} from "@remix-run/node";
import {backendAPIClientInstance, SearchShowsItemResult, ShowType} from "backend";
import {Link, useLoaderData, useSearchParams} from "@remix-run/react";
import CoverImage from "~/components/home/CoverImage";

//region Server

interface LoaderData {
    items: SearchShowsItemResult[]
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const title = url.searchParams.get("title");

    const backendResult = await backendAPIClientInstance.show_SearchShows(title);

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
    showType: ShowType;
}

function SearchResultItem({ id, title, coverImageURL, showType }: SearchResultItemProps) {
    return (
        <div style={{ width: "100%", margin: 'auto' }}>
            <Link to={`/home/shows/${id}`} style={{ textDecoration: "none" }}>
                <Card shadow="xs" p="lg">
                    <Group align={"end"}>
                        <CoverImage src={coverImageURL} width={100} height={150}/>

                        <Stack ml={8}>
                            <Title order={3}>{title}</Title>
                            <Text>
                                {(ShowType[showType])}
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
                {loaderData.items.map(s => (
                    <SearchResultItem key={s.remoteId ?? ""}
                                      id={s.remoteId ?? ""}
                                      title={s.title ?? ""}
                                      coverImageURL={s.coverImageURL}
                                      showType={s.showType ?? ShowType.Movie}
                    />
                ))}
            </Stack>
        </Container>
    );
}

//endregion
