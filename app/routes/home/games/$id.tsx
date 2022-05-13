import {
    Button,
    Chip,
    Container,
    Group,
    Image,
    MediaQuery,
    Skeleton,
    Stack,
    Text,
    ThemeIcon,
    Title
} from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    backendAPIClientInstance, BackendAPIException,
    GetGameResult, GetTrackedGameResult,
} from "backend";
import { Edit, Plus, Star } from "tabler-icons-react";
import { useEffect, useRef, useState } from "react";
import TrackGameEditorModal from "~/components/TrackGameEditorModal";
import { requireUserId } from "~/utils/session.server";

interface LoaderData {
    game: GetGameResult;
    trackedGame: GetTrackedGameResult | null
}

export const loader: LoaderFunction = async ({params, request}) => {
    const gameId: number = parseInt(params.id ?? "0");

    const getGameBackendAPIResponse = await backendAPIClientInstance.game_GetGame(gameId);
    const game = getGameBackendAPIResponse.result;

    const userId = await requireUserId(request);
    let trackedGame: GetTrackedGameResult | null = null;
    try {
        const getTrackedGameBackendAPIResponse = await backendAPIClientInstance.game_GetTrackedGame(userId, gameId);
        
        trackedGame = getTrackedGameBackendAPIResponse.result;
    } catch(err) {
        const backendError = err as BackendAPIException
        
        if (backendError.status != 404) {
            throw backendError;
        }
    }

    return json<LoaderData>({
        game: game,
        trackedGame: trackedGame
    });
}

interface GameHeaderProps {
    coverImageURL: string | undefined;
    title: string | undefined;
    rating: number | undefined;
    platforms: string[] | undefined;
    companies: string[] | undefined;
    isTracked: boolean;
    onButtonClick: () => void;
}

export function GameHeader({ coverImageURL, title, rating, platforms, companies, isTracked, onButtonClick }: GameHeaderProps) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        setIsImageLoaded(true);
    }, [imageRef.current?.complete])

    return (
        <>
            <Stack mr={12}>
                <Image imageRef={imageRef} onLoad={() => setIsImageLoaded(true)} src={coverImageURL} width={200}
                       height={300}
                       radius={"md"} hidden={!isImageLoaded}/>
                {!isImageLoaded && <Skeleton width={200} height={300} radius={"md"}/>}

                <Button color={isTracked ? "orange" : "indigo"} 
                        onClick={onButtonClick} 
                        leftIcon={isTracked ? <Edit size={20}/> : <Plus size={20}/>}>
                    {isTracked ? "Edit tracking" : "Add to list"}
                </Button>
            </Stack>
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
    const data = useLoaderData<LoaderData>();
    const [isModalOpened, setIsModalOpened] = useState(false);

    const toggleModal = () => {
        setIsModalOpened(value => !value);
    }

    const gameHeader = <GameHeader coverImageURL={data.game.coverImageURL}
                                   title={data.game.title}
                                   rating={data.game.rating}
                                   platforms={data.game.platforms}
                                   companies={data.game.companies}
                                   isTracked={!!data.trackedGame}
                                   onButtonClick={toggleModal}/>

    return (
        <Container py={16}>
            <TrackGameEditorModal opened={isModalOpened} 
                                  onModalClosed={toggleModal} 
                                  gameRemoteId={data.game.remoteId ?? 0}
                                  platforms={data.game.platforms ?? []}
                                  trackedGame={data.trackedGame}
            />

            <MediaQuery styles={{display: "none"}} largerThan={"sm"}>
                <Stack>
                    {gameHeader}
                </Stack>
            </MediaQuery>

            <MediaQuery styles={{display: "none"}} smallerThan={"sm"}>
                <Group align={"end"} noWrap>
                    {gameHeader}
                </Group>
            </MediaQuery>

            <Text mt={32}>{data.game.summary}</Text>
        </Container>
    );
}