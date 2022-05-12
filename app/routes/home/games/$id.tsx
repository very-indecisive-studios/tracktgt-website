import { Chip, Container, Grid, Group, Image, MediaQuery, Skeleton, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { backendAPIClientInstance, GetGameResult } from "backend";
import { Star } from "tabler-icons-react";
import { useEffect, useRef, useState } from "react";

export const loader: LoaderFunction = async ({params}) => {
    const id: number = parseInt(params.id ?? "0");

    const backendResult = await backendAPIClientInstance.game_GetGame(id);

    if (backendResult.status === 200) {
        return json(backendResult.result);
    }
}

interface GameHeaderProps {
    coverImageURL: string | undefined;
    title: string | undefined;
    rating: number | undefined;
    platforms: string[] | undefined;
    companies: string[] | undefined;
}

export function GameHeader({coverImageURL, title, rating, platforms, companies}: GameHeaderProps) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        setIsImageLoaded(true);
    }, [imageRef.current?.complete])

    return (
        <>
            <Image mr={12} imageRef={imageRef} onLoad={() => setIsImageLoaded(true)} src={coverImageURL} width={200}
                   height={300}
                   radius={"md"} hidden={!isImageLoaded}/>
            {!isImageLoaded && <Skeleton width={200} height={300} radius={"md"}/>}
            <Stack>
                <Title order={1}>{title}</Title>
                <Title order={4}>{companies?.join(", ")}</Title>
                <Group>
                    <ThemeIcon color={"yellow"}>
                        <Star size={16}/>
                    </ThemeIcon>
                    <Text size={"sm"}>{rating === 0 ? "No rating" : `${rating?.toFixed(0)}%`}</Text>
                </Group>
                <Group>
                    {platforms?.map(platform => (
                        <Chip checked={false} size={"sm"} key={platform}>{platform}</Chip>))}
                </Group>
            </Stack>
        </>
    );
}

export default function Game() {
    const game = useLoaderData<GetGameResult>();

    return (
        <Container py={16}>
            <MediaQuery styles={{display: "none"}} largerThan={"sm"}>
                <Stack>
                    <GameHeader coverImageURL={game.coverImageURL} title={game.title} rating={game.rating}
                                platforms={game.platforms} companies={game.companies}/>
                </Stack>
            </MediaQuery>
            
            <MediaQuery styles={{display: "none"}} smallerThan={"sm"}>
                <Group align={"end"} noWrap>
                    <GameHeader coverImageURL={game.coverImageURL} title={game.title} rating={game.rating}
                                platforms={game.platforms} companies={game.companies}/>
                </Group>
            </MediaQuery>
            
            <Text mt={32}>{game.summary}</Text>
        </Container>
    );
}