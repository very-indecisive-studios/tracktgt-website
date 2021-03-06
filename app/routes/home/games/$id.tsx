import {
    Box,
    BackgroundImage,
    Badge,
    Button,
    Container,
    Group,
    Image,
    MediaQuery,
    Stack, 
    Table,
    Tabs,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    backendAPIClientInstance,
    GetGameResult,
} from "backend";
import {
    CurrencyDollar,
    Edit,
    Heart,
    InfoCircle,
    Pencil,
    PlaylistAdd,
    Plus,
    Star,
    StarOff,
    TrashX
} from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import CoverImage from "~/components/home/CoverImage";
import { useModals } from "@mantine/modals";
import { useGamesWishlist } from "~/routes/home/games/wishlist/$gameId";
import { showGameWishlistEditorModal, showGameWishlistManageModal } from "~/components/home/games/GameWishlistModals";
import { useGameTrackings } from "~/routes/home/games/track/$gameId";
import { showGameTrackingEditorModal, showGameTrackingsSelectorModal } from "~/components/home/games/GameTrackingModals";
import React, { useEffect } from "react";
import { showNotification } from "@mantine/notifications";
import SwitchGamePrice from "~/components/home/games/SwitchGamePrice";
import { useMobileQuery } from "~/utils/hooks";
import PlatformIcon from "~/components/home/games/PlatformIcon";
import { mediaTabStyles } from "~/styles/tabStyles";
import Motion from "~/components/home/Motion";

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
    remoteId: number;
    coverImageURL: string;
    title: string;
    rating: number;
    platforms: string[];
    companies: string[];
}

interface TrackingButtonProps {
    game: Game;
}

function TrackingButton({ game }: TrackingButtonProps) {
    const modals = useModals();
    
    const { trackings, addTracking, updateTracking, removeTracking, actionDone, isLoading } 
        = useGameTrackings(game.remoteId);

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
                    Add tracking
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
        = useGamesWishlist(game.remoteId);
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
                        Manage wishlist
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
                    {game.companies.join(", ")}
                </Title>

                <Group>
                    <ThemeIcon color={"red"}>
                        <Heart size={16}/>
                    </ThemeIcon>
                    <Text sx={(theme) => ({ color: theme.colors.gray[6] })} size={"sm"}>
                        {game.rating === 0 ? "No rating" : `${game.rating.toFixed(0)}%`}
                    </Text>
                </Group>

                <Group mt={16}>
                    {game.platforms.map(platform => (
                        <Badge radius={"sm"} leftSection={<PlatformIcon platform={platform} />} py={4} color={"gray"} size={"lg"} key={platform}>
                            {platform}
                        </Badge>
                    ))}
                </Group>
            </Stack>
        </>
    );
}

interface GamePricingProps {
    game: Game;
}

function GamePricing({ game }: GamePricingProps) {
    const hasAnyPricing = game.platforms.includes("Switch");
    
    return (
        !hasAnyPricing ?
            <Text p={64} align={"center"}>No pricing available.</Text> :
            
            <Table mt={16} striped highlightOnHover verticalSpacing={"md"} fontSize={"md"} width={"100%"}>
                <thead>
                <tr>
                    <th></th>
                    <th style={{ minWidth: "15ch" }}>
                        <Group align={"center"} spacing={"xs"}>
                            <Text>Price</Text>
                            <Badge size={"xs"} color={"red"}>Beta</Badge>
                        </Group>
                    </th>
                </tr>
                </thead>
                <tbody>
                {game.platforms.includes("Switch") &&
                    <tr>
                        <td>
                            <Image px={16} src={"/eshop.svg"} width={100} />
                        </td>
                        <td style={{ minWidth: "15ch" }}>
                            <SwitchGamePrice gameRemoteId={game.remoteId} />
                        </td>
                    </tr>
                }
                </tbody>
            </Table>  
    );
}

export default function Game() {
    const isMobile = useMobileQuery();
    
    const data = useLoaderData<LoaderData>();

    const gameHeader = <GameHeader game={data.game} />

    return (
        <Motion>
            <Container py={16} sx={() => ({
                position: "relative"
            })}>
                <Box sx={() => ({
                    position: "absolute",
                    top: "0",
                    left: "0",
                    height: "300px",
                    width: "100%",
                })}>
                    <Image radius={"sm"} src={data.game.coverImageURL} height={300} sx={() => ({
                        filter: "brightness(0.4)"
                    })} />
                </Box>

                <MediaQuery styles={{ display: "none" }} largerThan={"sm"}>
                    <Stack mt={128}>
                        {gameHeader}
                    </Stack>
                </MediaQuery>

                <MediaQuery  styles={{ display: "none" }} smallerThan={"sm"}>
                    <Group mt={128} align={"end"} noWrap>
                        {gameHeader}
                    </Group>
                </MediaQuery>

                <Tabs grow
                    mt={48}
                    variant={"unstyled"}
                    styles={(theme) => mediaTabStyles(theme, theme.colors.blue[8])}>
                    <Tabs.Tab label={isMobile ? "" : "Info"}
                            icon={<InfoCircle size={18}/>}>
                        <Title order={2} mt={16}>Summary</Title>
                        <Text mt={8} sx={(theme) => ({ color: theme.colors.gray[6] })}>{data.game.summary}</Text>
                    </Tabs.Tab>
                    
                    <Tabs.Tab label={isMobile ? "" : "Pricing"}
                            icon={<CurrencyDollar size={18}/>}>
                        <GamePricing game={data.game} />
                    </Tabs.Tab>
                </Tabs>
            </Container>
        </Motion>
    );
}

//endregion
