import { Form } from "@remix-run/react";
import { Button, Card, Divider, Group, NumberInput, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { TrashX } from "tabler-icons-react";
import {
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus,
    GetGameResult,
    GetGameTrackingsItemResult
} from "backend";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import { showGameWishlistEditorModal } from "~/components/home/games/GameWishlistModals";

interface Game {
    title?: string;
    remoteId?: number;
    platforms?: string[];
}

interface GameTracking {
    platform?: string;
    hoursPlayed?: number;
    format?: GameTrackingFormat;
    status?: GameTrackingStatus;
    ownership?: GameTrackingOwnership;
}

interface GameTrackingRemoveConfirmModalProps {
    game: Game;
    platform: string;
    onCancel: () => void;
    onRemove: (formData: FormData) => void;
}

function GameTrackingRemoveConfirmModal({ game, platform, onCancel, onRemove }: GameTrackingRemoveConfirmModalProps) {
    return (
        <>
            <Form onSubmit={(e) => {
                e.preventDefault();
                onRemove(new FormData(e.currentTarget));
            }}>
                <Text>
                    Are you sure you want to remove tracking for this game on <b>{platform}</b>?
                    This is an irreversable action!
                </Text>
                <TextInput name={"platform"} defaultValue={platform} hidden={true}/>
                <Group position={"right"} mt={32}>
                    <Button variant={"outline"} onClick={onCancel}>Cancel</Button>
                    <Button color={"red"} type={"submit"}>Yes, I am sure</Button>
                </Group>
            </Form>
        </>
    );
}

export function showGameTrackingRemoveConfirmModal(
    modalsContext: ModalsContextProps,
    game: Game,
    platform: string,
    onRemove: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: "Confirm deletion",
        centered: true,
        children: (
            <GameTrackingRemoveConfirmModal
                game={game}
                platform={platform}
                onCancel={() => modalsContext.closeModal(id)}
                onRemove={(formData) => {
                    onRemove(formData);

                    modalsContext.closeAll();
                }}/>
        )
    });
}

interface GameTrackingEditorModalProps {
    game: Game;
    gameTrackings: GameTracking[];
    selectedGameTracking: GameTracking | null;
    onAdd: (formData: FormData) => void;
    onUpdate: (formData: FormData) => void;
    onRemove: (platform: string) => void;
}

function GameTrackingEditorModal({ game, gameTrackings, selectedGameTracking, onAdd, onUpdate, onRemove }: GameTrackingEditorModalProps) {
    // Get all statuses, formats and ownerships.
    const gameStatuses = Object.keys(GameTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const gameFormats = Object.keys(GameTrackingFormat)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const gameOwnerships = Object.keys(GameTrackingOwnership)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const availableGamePlatforms = game.platforms
        ?.filter(value => !gameTrackings.map(gt => gt.platform).includes(value)) ?? [];

    const gameTrackingsPlatforms = gameTrackings
        .map(gt => gt.platform ?? "")
        .filter(platform => platform);

    return (
        <Form onSubmit={(e) => {
            e.preventDefault();

            if (selectedGameTracking) {
                onUpdate(new FormData(e.currentTarget));
            } else {
                onAdd(new FormData(e.currentTarget));
            }
        }}>
            <TextInput name="gameRemoteId" hidden defaultValue={game.remoteId}/>
            <NumberInput name="hoursPlayed" label="Hours played"
                         defaultValue={selectedGameTracking?.hoursPlayed ?? 0}/>
            <Select name="platform"
                    label="Platform"
                    mt={16}
                    defaultValue={selectedGameTracking?.platform ?? availableGamePlatforms[0]}
                    data={selectedGameTracking ? gameTrackingsPlatforms : availableGamePlatforms}
                    disabled={!!selectedGameTracking}/>
            <Select name="status"
                    label="Status"
                    mt={16}
                    defaultValue={selectedGameTracking?.status?.toString() ?? gameStatuses[0].value}
                    data={gameStatuses}/>
            <Select name="format"
                    label="Format"
                    mt={16}
                    defaultValue={selectedGameTracking?.format?.toString() ?? gameFormats[0].value}
                    data={gameFormats}/>
            <Select name="ownership"
                    label="Ownership"
                    mt={16}
                    defaultValue={selectedGameTracking?.ownership?.toString() ?? gameOwnerships[0].value}
                    data={gameOwnerships}/>
            <Group mt={32} grow>
                <Group position={"left"}>
                    {selectedGameTracking &&
                        <Button color={"red"} onClick={() => onRemove(selectedGameTracking?.platform!!)}>
                            Remove
                        </Button>}
                </Group>
                <Group position={"right"}>
                    <Button type={"submit"}>
                        {selectedGameTracking ? "Save" : "Add"}
                    </Button>
                </Group>
            </Group>
        </Form>
    );
}

export function showGameTrackingEditorModal(
    modalsContext: ModalsContextProps,
    game: Game,
    selectedGameTracking: GameTracking | null,
    gameTrackings: GameTracking[],
    onAdd: (formData: FormData) => void,
    onUpdate: (formData: FormData) => void,
    onRemove: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: selectedGameTracking ? "Edit tracked game" : "Add tracked game",
        centered: true,
        children: (
            <GameTrackingEditorModal 
                game={game} 
                gameTrackings={gameTrackings} 
                selectedGameTracking={selectedGameTracking} 
                onAdd={(formData) => {
                    onAdd(formData);
                    
                    modalsContext.closeAll();
                }}
                onUpdate={(formData) => {
                    onUpdate(formData);

                    modalsContext.closeAll();
                }}
                onRemove={(platform) => {
                    showGameTrackingRemoveConfirmModal(modalsContext, game, platform, onRemove);
                }} />
        )
    });
}

export function showGameTrackingsSelectorModal(
    modalsContext: ModalsContextProps,
    game: Game,
    gameTrackings: GameTracking[],
    onAdd: (formData: FormData) => void,
    onUpdate: (formData: FormData) => void,
    onRemove: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: "Select tracking to edit",
        centered: true,
        children: (
            <Stack>
                {gameTrackings.map(gt => (
                    <Card onClick={() => showGameTrackingEditorModal(
                        modalsContext,
                        game,
                        gt,
                        gameTrackings,
                        onAdd,
                        onUpdate,
                        onRemove)}
                          sx={theme => ({
                              '&:hover': {
                                  backgroundColor: theme.colors.gray[8],
                                  cursor: "pointer"
                              },
                          })}>
                        <Title order={5}>{gt.platform}</Title>
                    </Card>
                ))}
                {(gameTrackings.length < (game.platforms?.length ?? 0)) &&
                    <>
                        <Divider my="xs" label="Or" labelPosition="center" />
                        <Button fullWidth 
                                onClick={() => showGameTrackingEditorModal(
                                    modalsContext, 
                                    game,
                                    null,
                                    gameTrackings,
                                    onAdd,
                                    () => {},
                                    () => {}
                                )}>
                            Add another platform to track
                        </Button>
                    </>
                }
            </Stack>
        )
    });
}