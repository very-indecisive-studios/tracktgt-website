import { Container, Title, Image, Group, Stack, Chip, Text, Button, ThemeIcon } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { backendAPIClientInstance, BackendAPIException, GetGameResult } from "backend";
import { Star } from "tabler-icons-react";

export const loader: LoaderFunction = async ({ params }) => {
    const id: number = parseInt(params.id ?? "0");

    const backendResult = await backendAPIClientInstance.game_GetGame(id);

    if (backendResult.status === 200) {
        return json(backendResult.result);
    }
}

export default function Game() {
    const game = useLoaderData<GetGameResult>();
    
    return (
        <Container py={16}>
            <Group align={"end"}>
                <Image src={game.coverImageURL} width={200} height={300} radius={"md"} />
                <Stack ml={12}>
                    <Title order={1}>{game.title}</Title>
                    <Title order={4}>{game.companies?.join(", ")}</Title>
                    <Group>
                        <ThemeIcon color={"yellow"}>
                            <Star size={16}/>
                        </ThemeIcon>
                        <Text size={"sm"}>{game.rating === 0 ? "No rating" : `${game.rating?.toFixed(0)}%`}</Text>
                    </Group>
                    <Group>
                        {game.platforms?.map(platform => (<Chip checked={false} size={"sm"} key={platform}>{platform}</Chip>))}
                    </Group>
                </Stack>
            </Group>
            <Text mt={32}>{game.summary}</Text>
        </Container>
    );
}