import { Badge, Button, Container, Group, MediaQuery, Stack, Text, ThemeIcon, Title, } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    backendAPIClientInstance,
    GetGameResult,
} from "backend";
import { Edit, Heart, Pencil, PlaylistAdd, Plus, Star, StarOff, TrashX } from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import CoverImage from "~/components/home/CoverImage";
import { useModals } from "@mantine/modals";
import { useGamesWishlist } from "~/routes/home/games/wishlist/$id";
import { showGameWishlistEditorModal, showGameWishlistManageModal } from "~/components/home/games/GameWishlistModals";
import { useGameTrackings } from "~/routes/home/games/track/$id";
import { showGameTrackingEditorModal, showGameTrackingsSelectorModal } from "~/components/home/games/GameTrackingModals";
import React, { useEffect } from "react";
import { showNotification } from "@mantine/notifications";

//region Server

interface LoaderData {
    game: GetGameResult;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);
    const gameId: number = parseInt(params.id ?? "0");

    const getGameBackendAPIResponse = await backendAPIClientInstance.game_GetGame(gameId);

    return json<LoaderData>({
        game: getGameBackendAPIResponse.result,
    });
}

//endregion

//region Client

interface Game {
    remoteId?: number | undefined;
    coverImageURL?: string | undefined;
    title?: string | undefined;
    rating?: number | undefined;
    platforms?: string[] | undefined;
    companies?: string[] | undefined;
}

interface TrackingButtonProps {
    game: Game;
}

function TrackingButton({ game }: TrackingButtonProps) {
    const modals = useModals();
    
    const { trackings, addTracking, updateTracking, removeTracking, actionDone, isLoading } 
        = useGameTrackings(game.remoteId ?? 0);

    // Action notifications
    useEffect(() => {
        if (actionDone == "add") {
            showNotification({
                title: 'Successfully added game to tracking.',
                message: `Your changes have been saved.`,
                icon: <PlaylistAdd size={16}/>,
                color: "green"
            });
        } else if (actionDone == "update") {
            showNotification({
                title: 'Successfully updated game tracking.',
                message: `Your changes have been saved.`,
                icon: <Pencil size={16}/>,
                color: "green"
            });
        } else if (actionDone == "remove") {
            showNotification({
                title: 'Successfully removed game tracking.',
                message: `Your changes have been saved.`,
                icon: <TrashX size={16}/>,
                color: "red"
            });
        }
    }, [actionDone]);
    
    return (
        <>
            {(trackings.length < 1) ?
                <Button color={"indigo"}
                        onClick={() => showGameTrackingEditorModal(
                            modals,
                            game,
                            null,
                            trackings,
                            addTracking,
                            updateTracking,
                            removeTracking
                        )}
                        leftIcon={<Plus size={20}/>}
                        loading={isLoading}>
                    Create tracking
                </Button> :
                <Button color={"orange"}
                        onClick={() => showGameTrackingsSelectorModal(
                            modals,
                            game,
                            trackings,
                            addTracking,
                            updateTracking,
                            removeTracking
                        )}
                        leftIcon={<Edit size={20}/>}
                        loading={isLoading}>
                    Manage trackings
                </Button>
            }
        </>
    );
}

interface WishlistButtonProps {
    game: Game;
}

function WishlistButton({ game }: WishlistButtonProps) {
    const { wishlists, addToWishlist, removeFromWishlist, actionDone, isLoading } 
        = useGamesWishlist(game.remoteId ?? 0);
    const modals = useModals();

    // Action notifications
    useEffect(() => {
        if (actionDone == "add") {
            showNotification({
                title: 'Successfully added game to wishlist.',
                message: `Your changes have been saved.`,
                icon: <Star size={16}/>,
                color: "yellow"
            });
        } else if (actionDone == "remove") {
            showNotification({
                title: 'Successfully removed game from wishlist.',
                message: `Your changes have been saved.`,
                icon: <StarOff size={16}/>,
                color: "red"
            });
        }
    }, [actionDone]);
    
    return (
        <>
            {
                (wishlists.length < 1) ?
                    <Button color={"yellow"}
                            onClick={() => {
                                showGameWishlistEditorModal(modals, game, wishlists, addToWishlist)
                            }}
                            leftIcon={<Star size={20}/>}
                            loading={isLoading}>
                        Add to wishlist
                    </Button> :
                    <Button color={"yellow"}
                            variant={"outline"}
                            onClick={() => {
                                showGameWishlistManageModal(modals, game, wishlists, addToWishlist, removeFromWishlist)
                            }}
                            leftIcon={<Star size={20}/>}
                            loading={isLoading}>
                        Edit wishlist
                    </Button>
            }
        </>
    );
}

interface GameHeaderProps {
    game: Game;
}

export function GameHeader({ game }: GameHeaderProps) {
    return (
        <>
            <Stack mr={12}>
                <CoverImage src={game.coverImageURL} width={200} height={300}/>
                
                <TrackingButton game={game} />
                <WishlistButton game={game} />
            </Stack>

            <Stack spacing={"xs"}>
                <Title order={1}>
                    {game.title}
                </Title>

                <Title order={4} sx={(theme) => ({
                    color: theme.colors.gray[6],
                })}>
                    {game.companies?.join(", ")}
                </Title>

                <Group>
                    <ThemeIcon color={"red"}>
                        <Heart size={16}/>
                    </ThemeIcon>
                    <Text sx={(theme) => ({ color: theme.colors.gray[6] })} size={"sm"}>
                        {game.rating === 0 ? "No rating" : `${game.rating?.toFixed(0)}%`}
                    </Text>
                </Group>

                <Group mt={16}>
                    {game.platforms?.map(platform => (
                        <Badge color={"gray"} size={"lg"} key={platform}>{platform}</Badge>))}
                </Group>
            </Stack>
        </>
    );
}

export default function Game() {
    const data = useLoaderData<LoaderData>();

    const gameHeader = <GameHeader game={data.game} />

    return (
        <Container py={16}>
            <MediaQuery styles={{ display: "none" }} largerThan={"sm"}>
                <Stack>
                    {gameHeader}
                </Stack>
            </MediaQuery>

            <MediaQuery styles={{ display: "none" }} smallerThan={"sm"}>
                <Group align={"end"} noWrap>
                    {gameHeader}
                </Group>
            </MediaQuery>

            <Stack mt={48}>
                <Title order={2}>Summary</Title>
                <Text sx={(theme) => ({ color: theme.colors.gray[6] })}>{data.game.summary}</Text>
            </Stack>
        </Container>
    );
}

//endregion
