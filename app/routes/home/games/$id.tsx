import {
    Button,
    Chip,
    Container,
    Group,
    MediaQuery, NumberInput, Select,
    Stack,
    Text, TextInput,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import {
    backendAPIClientInstance, BackendAPIException,
    GetGameResult, GetTrackedGameResult, TrackedGameFormat, TrackedGameOwnership, TrackedGameStatus,
} from "backend";
import { Edit, Pencil, PlaylistAdd, Plus, Star, TrashX } from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import CoverImage from "~/components/CoverImage";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";

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
    return (
        <>
            <Stack mr={12}>
                <CoverImage src={coverImageURL} width={200} height={300} />

                <Button color={isTracked ? "orange" : "indigo"} 
                        onClick={onButtonClick} 
                        leftIcon={isTracked ? <Edit size={20}/> : <Plus size={20}/>}>
                    {isTracked ? "Edit existing" : "Create tracking"}
                </Button>
            </Stack>
            
            <Stack spacing={"xs"}>
                <Title order={1}>
                    {title}
                </Title>
                
                <Title order={4} sx={(theme) => ({
                    color: theme.colors.gray[6],
                })}>
                    {companies?.join(", ")}
                </Title>
                
                <Group>
                    <ThemeIcon color={"yellow"}>
                        <Star size={16}/>
                    </ThemeIcon>
                    <Text sx={(theme) => ({ color: theme.colors.gray[6] })} size={"sm"}>
                        {rating === 0 ? "No rating" : `${rating?.toFixed(0)}%`}
                    </Text>
                </Group>
                
                <Group mt={16}>
                    {platforms?.map(platform => (
                        <Chip checked={false} size={"sm"} key={platform}>{platform}</Chip>))}
                </Group>
            </Stack>
        </>
    );
}

export default function Game() {
    const data = useLoaderData<LoaderData>();
    
    const modals = useModals();

    const showDeleteConfirmModal = () => {
        const id = modals.openModal({
            title: "Confirm deletion",
            centered: true,
            children: (
                <Form action={"/home/games/track"} method={"delete"}>
                    <Text>
                        Are you sure you want to remove tracking for this game on <b>{data.trackedGame?.platform}</b>?
                        This is an irreversable action!
                    </Text>
                    <TextInput name={"gameRemoteId"} defaultValue={data?.game?.remoteId} hidden={true} />
                    <Group position={"right"} mt={32} >
                        <Button variant={"outline"} onClick={() => modals.closeModal(id)}>Cancel</Button>
                        <Button color={"red"} type={"submit"} onClick={() => {
                            showNotification({
                                title: 'Successfully removed tracked game',
                                message: `Removed ${data.game.title} for ${data.trackedGame?.platform} from tracking.`,
                                icon: <TrashX size={16} />,
                                color: "red"
                            });
                            
                            modals.closeAll();
                        }}>Yes, I am sure</Button>
                    </Group>
                </Form>
            )
        });
    }
    
    const showTrackGameEditorModal = () => {
        const gameStatuses = Object.keys(TrackedGameStatus)
            .filter((s) => isNaN(Number(s)))
            .map((value, index) => ({value: index.toString(), label: value}))

        const gameFormats = Object.keys(TrackedGameFormat)
            .filter((s) => isNaN(Number(s)))
            .map((value, index) => ({value: index.toString(), label: value}))

        const gameOwnerships = Object.keys(TrackedGameOwnership)
            .filter((s) => isNaN(Number(s)))
            .map((value, index) => ({value: index.toString(), label: value}))

        const gamePlatforms = data.game.platforms?.map(value => ({value: value, label: value})) ?? [];
        
        const id = modals.openModal({
            title: data.trackedGame ? "Edit tracked game" : "Add tracked game",
            centered: true,
            children: (
                <Form action={"/home/games/track"} method={data.trackedGame ? "put" : "post"}>
                    <TextInput name="gameRemoteId" hidden defaultValue={data.game.remoteId}/>
                    <NumberInput name="hoursPlayed" label="Hours played" defaultValue={data.trackedGame?.hoursPlayed ?? 0}/>
                    <Select name="platform" defaultValue={data.trackedGame?.platform ?? gamePlatforms[0].value} mt={16}
                            label="Platform" data={gamePlatforms}/>
                    <Select name="status" defaultValue={data.trackedGame?.status?.toString() ?? gameStatuses[0].value} mt={16}
                            label="Status" data={gameStatuses}/>
                    <Select name="format" defaultValue={data.trackedGame?.format?.toString() ?? gameFormats[0].value} mt={16}
                            label="Format" data={gameFormats}/>
                    <Select name="ownership" defaultValue={data.trackedGame?.ownership?.toString() ?? gameOwnerships[0].value}
                            mt={16} label="Ownership" data={gameOwnerships}/>
                    <Group mt={32} grow>
                        <Group position={"left"}>
                            { data.trackedGame && <Button color={"red"} onClick={showDeleteConfirmModal}>Remove</Button> }
                        </Group>
                        <Group position={"right"}>
                            <Button variant={"outline"} onClick={() => modals.closeModal(id)}>Cancel</Button>
                            <Button type={"submit"} onClick={() => {
                                if (data.trackedGame) {
                                    showNotification({
                                        title: 'Successfully updated tracked game',
                                        message: `Updated ${data.game.title} for ${data.trackedGame.platform}.`,
                                        icon: <Pencil size={16} />,
                                        color: "green"
                                    });
                                } else {
                                    showNotification({
                                        title: 'Successfully added tracked game',
                                        message: `Added ${data.game.title} for tracking.`,
                                        icon: <PlaylistAdd size={16} />,
                                        color: "green"
                                    });
                                }
                                
                                modals.closeAll();
                            }}>
                                {data.trackedGame ? "Save" : "Add"}
                            </Button>
                        </Group>
                    </Group>
                </Form>
            )
        });
    }

    const gameHeader = <GameHeader coverImageURL={data.game.coverImageURL}
                                   title={data.game.title}
                                   rating={data.game.rating}
                                   platforms={data.game.platforms}
                                   companies={data.game.companies}
                                   isTracked={!!data.trackedGame}
                                   onButtonClick={showTrackGameEditorModal}/>

    return (
        <Container py={16}>
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
            
            <Stack mt={48}>
                <Title order={2}>Summary</Title>
                <Text sx={(theme) => ({ color: theme.colors.gray[6] })}>{data.game.summary}</Text>
            </Stack>
        </Container>
    );
}