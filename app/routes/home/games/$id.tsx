import {
    Button, Card,
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
    backendAPIClientInstance,
    GetGameResult,
    GetGameTrackingsItemResult,
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus,
} from "backend";
import { Edit, Pencil, PlaylistAdd, Plus, Star, TrashX } from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import CoverImage from "~/components/CoverImage";
import { useModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { platform } from "os";

interface LoaderData {
    game: GetGameResult;
    gameTrackings: GetGameTrackingsItemResult[]
}

export const loader: LoaderFunction = async ({params, request}) => {
    const gameId: number = parseInt(params.id ?? "0");

    const getGameBackendAPIResponse = await backendAPIClientInstance.game_GetGame(gameId);
    const game = getGameBackendAPIResponse.result;

    const userId = await requireUserId(request);

    const getGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetGameTrackings(userId, gameId);

    return json<LoaderData>({
        game: game,
        gameTrackings: getGameTrackingsBackendAPIResponse.result.items ?? []
    });
}

interface GameHeaderProps {
    coverImageURL: string | undefined;
    title: string | undefined;
    rating: number | undefined;
    platforms: string[] | undefined;
    companies: string[] | undefined;
    noOfGameTrackings: number;
    onAddClick: () => void;
    onEditClick: () => void;
}

export function GameHeader({
   coverImageURL,
   title,
   rating,
   platforms,
   companies,
   noOfGameTrackings,
   onAddClick, 
   onEditClick
}: GameHeaderProps) {
    return (
        <>
            <Stack mr={12}>
                <CoverImage src={coverImageURL} width={200} height={300}/>

                {(noOfGameTrackings < (platforms?.length ?? 1)) &&
                    <Button color={"indigo"}
                            onClick={onAddClick}
                            leftIcon={<Plus size={20}/>}>
                        Create tracking
                    </Button>}
                
                {(noOfGameTrackings > 0) &&
                    <Button color={"orange"}
                            onClick={onEditClick}
                            leftIcon={<Edit size={20}/>}>
                        Edit tracking
                    </Button>}
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
                    <Text sx={(theme) => ({color: theme.colors.gray[6]})} size={"sm"}>
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

    const showDeleteConfirmModal = (platform: string) => {
        const id = modals.openModal({
            title: "Confirm deletion",
            centered: true,
            children: (
                <Form action={"/home/games/track"} method={"delete"}>
                    <Text>
                        Are you sure you want to remove tracking for this game on <b>{platform}</b>?
                        This is an irreversable action!
                    </Text>
                    <TextInput name={"gameRemoteId"} defaultValue={data?.game?.remoteId} hidden={true}/>
                    <TextInput name={"platform"} defaultValue={platform} hidden={true}/>
                    <Group position={"right"} mt={32}>
                        <Button variant={"outline"} onClick={() => modals.closeModal(id)}>Cancel</Button>
                        <Button color={"red"} type={"submit"} onClick={() => {
                            showNotification({
                                title: 'Successfully removed tracked game',
                                message: `Removed ${data.game.title} for ${platform} from tracking.`,
                                icon: <TrashX size={16}/>,
                                color: "red"
                            });

                            modals.closeAll();
                        }}>Yes, I am sure</Button>
                    </Group>
                </Form>
            )
        });
    }

    const showTrackGameEditorModal = (gameTracking: GetGameTrackingsItemResult | null) => {
        const gameStatuses = Object.keys(GameTrackingStatus)
            .filter((s) => isNaN(Number(s)))
            .map((value, index) => ({value: index.toString(), label: value}))

        const gameFormats = Object.keys(GameTrackingFormat)
            .filter((s) => isNaN(Number(s)))
            .map((value, index) => ({value: index.toString(), label: value}))

        const gameOwnerships = Object.keys(GameTrackingOwnership)
            .filter((s) => isNaN(Number(s)))
            .map((value, index) => ({value: index.toString(), label: value}))

        const gamePlatforms = data.game.platforms
            ?.filter(value => !data.gameTrackings.map(tg => tg.platform).includes(value))
            .map(value => ({value: value, label: value})) ?? [];
        const gameTrackingsPlatforms = data.gameTrackings
            .map(tg => tg.platform ?? "")
            .filter(platform => platform)
            .map(platform => ({value: platform, label: platform}));

        const id = modals.openModal({
            title: gameTracking ? "Edit tracked game" : "Add tracked game",
            centered: true,
            children: (
                <Form action={"/home/games/track"} method={gameTracking ? "put" : "post"}>
                    <TextInput name="gameRemoteId" hidden defaultValue={data.game.remoteId}/>
                    <NumberInput name="hoursPlayed" label="Hours played" defaultValue={gameTracking?.hoursPlayed ?? 0}/>
                    <Select name="platform" 
                            label="Platform" 
                            mt={16}
                            defaultValue={gameTracking?.platform ?? gamePlatforms[0].value}
                            data={gameTracking ? gameTrackingsPlatforms : gamePlatforms} 
                            disabled={!!gameTracking}/>
                    <Select name="status" 
                            label="Status" 
                            mt={16}
                            defaultValue={gameTracking?.status?.toString() ?? gameStatuses[0].value}
                            data={gameStatuses}/>
                    <Select name="format" 
                            label="Format" 
                            mt={16}
                            defaultValue={gameTracking?.format?.toString() ?? gameFormats[0].value} 
                            data={gameFormats}/>
                    <Select name="ownership"
                            label="Ownership" 
                            mt={16} 
                            defaultValue={gameTracking?.ownership?.toString() ?? gameOwnerships[0].value}
                            data={gameOwnerships}/>
                    <Group mt={32} grow>
                        <Group position={"left"}>
                            {gameTracking &&
                                <Button color={"red"}
                                        onClick={() => showDeleteConfirmModal(gameTracking?.platform ?? "")}>
                                    Remove
                                </Button>}
                        </Group>
                        <Group position={"right"}>
                            <Button variant={"outline"} onClick={() => modals.closeModal(id)}>Cancel</Button>
                            <Button type={"submit"} onClick={() => {
                                if (gameTracking) {
                                    showNotification({
                                        title: 'Successfully updated tracked game',
                                        message: `Updated ${data.game.title} for ${gameTracking.platform}.`,
                                        icon: <Pencil size={16}/>,
                                        color: "green"
                                    });
                                } else {
                                    showNotification({
                                        title: 'Successfully added tracked game',
                                        message: `Added ${data.game.title} for tracking.`,
                                        icon: <PlaylistAdd size={16}/>,
                                        color: "green"
                                    });
                                }

                                modals.closeAll();
                            }}>
                                {gameTracking ? "Save" : "Add"}
                            </Button>
                        </Group>
                    </Group>
                </Form>
            )
        });
    }
    
    const showGameTrackingsSelectorModal = (gameTrackings: GetGameTrackingsItemResult[]) => {
        const id = modals.openModal({
            title: "Select tracking to edit",
            centered: true,
            children: (
                <Stack>
                    {gameTrackings.map(tg => (
                        <Card onClick={() => showTrackGameEditorModal(tg)} sx={theme => ({
                            '&:hover': {
                                backgroundColor: theme.colors.gray[8],
                                cursor: "pointer"
                            },
                        })}>
                            <Title order={5}>{tg.platform}</Title>
                        </Card>
                    ))}
                </Stack>
            )
        });
    }
    
    const gameHeader = <GameHeader coverImageURL={data.game.coverImageURL}
                                   title={data.game.title}
                                   rating={data.game.rating}
                                   platforms={data.game.platforms}
                                   companies={data.game.companies}
                                   noOfGameTrackings={data.gameTrackings.length}
                                   onAddClick={() => showTrackGameEditorModal(null)}
                                   onEditClick={() => showGameTrackingsSelectorModal(data.gameTrackings)}/>

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
                <Text sx={(theme) => ({color: theme.colors.gray[6]})}>{data.game.summary}</Text>
            </Stack>
        </Container>
    );
}