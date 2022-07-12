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
import { Link, useLoaderData, useLocation } from "@remix-run/react";
import { MoodSad } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";
import PlatformIcon from "~/components/home/games/PlatformIcon";
import Motion from "~/components/home/Motion";

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

interface GameTrackingCardProps {
    link: string;
    coverImageURL: string;
    title: string;
    platform: string;
}

function GameTrackingCard({ link, coverImageURL, title, platform }: GameTrackingCardProps) {
    return (
        <Link to={link} style={{ textDecoration: "none" }}>
            <Card shadow="sm" p="lg" sx={() => ({
                height: 300,
                width: 200
            })}>
                <Card.Section>
                    <Image src={coverImageURL} height={220} fit={"cover"}/>
                </Card.Section>

                <Text mt={12} size={"md"} sx={() => ({
                    width: "14ch",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                })}>
                    {title}
                </Text>

                <Group mt={4}>
                    <Badge radius={"sm"} leftSection={<PlatformIcon platform={platform} />} py={4} color={"gray"} size={"md"} key={platform}>
                        {platform}
                    </Badge>
                </Group>
            </Card>
        </Link>
    );
}

interface MediaTrackingCardProps {
    link: string;
    coverImageURL: string;
    title: string;
}

function MediaTrackingCard({ link, coverImageURL, title }: MediaTrackingCardProps) {
    return (
        <Link to={link} style={{ textDecoration: "none" }}>
            <Card shadow="sm" p="lg" sx={() => ({
                height: 300,
                width: 200
            })}>
                <Card.Section>
                    <Image src={coverImageURL} height={250} fit={"cover"}/>
                </Card.Section>

                <Text mt={12} size={"md"} sx={() => ({
                    width: "14ch",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                })}>
                    {title}
                </Text>
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
    const isMobile = useMobileQuery();

    return (
        <Motion>
            <Container px={isMobile ? 4 : 16} py={16}>
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
                        <GameTrackingCard key={`${gt.gameRemoteId}${gt.platform}`}
                                        link={`/home/games/${gt.gameRemoteId}`}
                                        title={gt.title}
                                        coverImageURL={gt.coverImageURL}
                                        platform={gt.platform} />
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
        </Motion>
    );
}