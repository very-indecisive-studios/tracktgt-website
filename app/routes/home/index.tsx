import { Badge, Card, Container, Group, Image, Text, Title } from "@mantine/core";
import React from "react";
import { json, LoaderFunction } from "@remix-run/node";
import { backendAPIClientInstance, GetAllGameTrackingsItemResult } from "backend";
import { requireUserId } from "~/utils/session.server";
import { Link, useLoaderData } from "@remix-run/react";

interface LoaderData {
    games: GetAllGameTrackingsItemResult[];
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);

    const getGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetAllGameTrackings(
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

    return json<LoaderData>({
        games: getGameTrackingsBackendAPIResponse.result.items ?? []
    });
}

interface MediaTrackingCardProps {
    link: string;
    coverImageURL: string;
    title: string;
    tag: string;
}

function MediaTrackingCard({ link, coverImageURL, title, tag }: MediaTrackingCardProps) {
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
                    width: "10ch",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                })}>
                    {title}
                </Text>

                <Badge color={"gray"} size={"sm"}>{tag}</Badge>
            </Card>
        </Link>
    );
}

export default function Home() {
    const loaderData = useLoaderData<LoaderData>();

    return (
        <Container py={16}>
            <Title mb={32} order={1}>Dashboard</Title>

            <Title order={3} sx={(theme) => ({
                color: theme.colors.gray[6]
            })}>
                Recent games
            </Title>
            <Group py={16} mt={16} sx={() => ({
                flexWrap: "nowrap",
                overflowY: "scroll"
            })}>
                {loaderData.games.map((gt) => (
                    <MediaTrackingCard key={`${gt.gameRemoteId}${gt.platform}`}
                                       link={`/home/games/${gt.gameRemoteId}`}
                                       title={gt.title ?? ""}
                                       coverImageURL={gt.coverImageURL ?? ""}
                                       tag={gt.platform ?? ""}/>
                ))}
            </Group>
        </Container>
    );
}