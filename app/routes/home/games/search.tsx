import { Group, Title, Image, Container, Stack, Card, Chip, Skeleton } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import {
    backendAPIClientInstance,
    SearchGamesResult
} from "backend";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

export const loader: LoaderFunction = async ({request}) => {
    const url = new URL(request.url);
    const title = url.searchParams.get("title");

    const backendResult = await backendAPIClientInstance.game_SearchGames(title);

    if (backendResult.status === 200) {
        return json(backendResult.result);
    }
}

interface SearchResultItemProps {
    id: number;
    title: string;
    coverImageURL: string | undefined;
    platforms: string[];
}

function SearchResultItem({id, title, coverImageURL, platforms}: SearchResultItemProps) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        setIsImageLoaded(true);
    }, [imageRef.current?.complete])
    
    return (
        <div style={{width: "100%", margin: 'auto'}}>
            <Link to={`/home/games/${id}`} style={{textDecoration: "none"}}>
                <Card shadow="xs" p="lg">
                    <Group align={"end"}>
                        <Image imageRef={imageRef} onLoad={() => setIsImageLoaded(true)} src={coverImageURL} 
                               hidden={!isImageLoaded}
                               width={100}
                               height={150}
                               radius={"md"}/>
                        { !isImageLoaded && <Skeleton width={100} height={150} radius={"md"}/> }
                        <Stack ml={8}>
                            <Title order={3}>{title}</Title>
                            <Group>
                                {platforms.map(platform => (<Chip size={"sm"} key={platform}>{platform}</Chip>))}
                            </Group>
                        </Stack>
                    </Group>
                </Card>
            </Link>
        </div>
    );
}

export default function Search() {
    const searchResults = useLoaderData<SearchGamesResult>();
    const [searchParams, _] = useSearchParams();
    const title = searchParams.get("title");

    return (
        <Container py={16}>
            <Title mb={32} order={2}>Search results for "{title}"</Title>
            <Stack>
                {searchResults?.games?.map(g => (
                    <SearchResultItem key={g.remoteId ?? 0}
                                      id={g.remoteId ?? 0}
                                      title={g.title ?? ""}
                                      coverImageURL={g.coverImageURL}
                                      platforms={g.platforms ?? []}
                    />
                ))}
            </Stack>
        </Container>
    );
}