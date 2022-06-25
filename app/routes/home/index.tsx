import { Badge, Card, Container, Group, Image, Stack, Text, Title } from "@mantine/core";
import React from "react";
import { json, LoaderFunction } from "@remix-run/node";
import {
    backendAPIClientInstance,
    GetAllBookTrackingsItemResult,
    GetAllGameTrackingsItemResult,
    GetAllShowTrackingsItemResult
} from "backend";
import { requireUserId } from "~/utils/session.server";
import { Link, useLoaderData } from "@remix-run/react";
import { MoodSad } from "tabler-icons-react";

interface LoaderData {
    games: GetAllGameTrackingsItemResult[];
    books: GetAllBookTrackingsItemResult[];
    shows: GetAllShowTrackingsItemResult[];
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);

    const getAllGameTrackingsResponse = await backendAPIClientInstance.game_GetAllGameTrackings(
        userId,
        null,
        true,
        false,
        false,
        false,
        false,
        1,
        4
    );

    const getAllBookTrackingsResponse = await backendAPIClientInstance.book_GetAllBookTrackings(
        userId,
        null,
        true,
        false,
        false,
        false,
        1,
        4
    );

    const getAllShowTrackingsResponse = await backendAPIClientInstance.show_GetAllShowTrackings(
        userId,
        null,
        true,
        false,
        1,
        4
    );

    return json<LoaderData>({
        games: getAllGameTrackingsResponse.result.items,
        books: getAllBookTrackingsResponse.result.items,
        shows: getAllShowTrackingsResponse.result.items
    });
}

interface MediaTrackingCardProps {
    link: string;
    coverImageURL: string;
    title: string;
    tag?: string | undefined;
}

function MediaTrackingCard({ link, coverImageURL, title, tag }: MediaTrackingCardProps) {
    return (
        <Link to={link} style={{ textDecoration: "none" }}>
            <Card shadow="sm" p="lg" sx={() => ({
                height: 300,
                width: 200
            })}>
                <Card.Section>
                    <Image src={coverImageURL} height={tag ? 220 : 250} fit={"cover"}/>
                </Card.Section>

                <Text mt={12} size={"md"} sx={() => ({
                    width: "14ch",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                })}>
                    {title}
                </Text>

                {tag && <Badge color={"gray"} size={"sm"}>{tag}</Badge>}
            </Card>
        </Link>
    );
}

interface EmptyProps {
    type: string;
}

function Empty({ type }: EmptyProps) {
    return (
        <Container py={32} sx={(theme) => ({
            color: theme.colors.gray[7]
        })}>
            <Stack align={"center"}>
                    <MoodSad size={96}/>
                    <Text>You have not tracked any {type} yet.</Text>
            </Stack>
        </Container>
    );
}

export default function Home() {
    const loaderData = useLoaderData<LoaderData>();

    return (
        <Container py={16}>
            <Title mb={32} order={1}>Dashboard</Title>

            <Title order={2} sx={(theme) => ({
                color: theme.colors.gray[6]
            })}>
                Recent games
            </Title>
            <Group py={16} mt={16} sx={() => ({
                flexWrap: "nowrap",
                overflowX: "auto"
            })}>
                {loaderData.games.length === 0 && <Empty type={"games"} />}

                {loaderData.games.map((gt) => (
                    <MediaTrackingCard key={`${gt.gameRemoteId}${gt.platform}`}
                                       link={`/home/games/${gt.gameRemoteId}`}
                                       title={gt.title}
                                       coverImageURL={gt.coverImageURL}
                                       tag={gt.platform} />
                ))}
            </Group>

            <Title mt={48} order={2} sx={(theme) => ({
                color: theme.colors.gray[6]
            })}>
                Recent shows
            </Title>
            <Group py={16} mt={16} sx={() => ({
                flexWrap: "nowrap",
                overflowX: "auto"
            })}>
                {loaderData.shows.length === 0 && <Empty type={"shows"} />}

                {loaderData.shows.map((st) => (
                    <MediaTrackingCard key={`${st.showRemoteId}`}
                                       link={`/home/shows/${st.showRemoteId}`}
                                       title={st.title}
                                       coverImageURL={st.coverImageURL} />
                ))}
            </Group>

            <Title mt={48} order={2} sx={(theme) => ({
                color: theme.colors.gray[6]
            })}>
                Recent books
            </Title>
            <Group py={16} mt={16} sx={() => ({
                flexWrap: "nowrap",
                overflowX: "auto"
            })}>
                {loaderData.books.length === 0 && <Empty type={"books"} />}
                
                {loaderData.books.map((bt) => (
                    <MediaTrackingCard key={`${bt.bookRemoteId}`}
                                       link={`/home/books/${bt.bookRemoteId}`}
                                       title={bt.title}
                                       coverImageURL={bt.coverImageURL} />
                ))}
            </Group>
        </Container>
    );
}