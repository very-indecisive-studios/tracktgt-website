import { Form } from "@remix-run/react";
import { Button, Card, Group, NumberInput, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Pencil, PlaylistAdd, TrashX } from "tabler-icons-react";
import {
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus,
    GetGameResult,
    GetGameTrackingsItemResult
} from "backend";
import { ModalsContextProps } from "@mantine/modals/lib/context";

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

interface DeleteConfirmModalProps {
    game: Game;
    platform: string;
    onCancel: () => void;
    onConfirm: () => void;
    onDelete: (formData: FormData) => void;
}

function DeleteConfirmModal({ game, platform, onCancel, onConfirm, onDelete }: DeleteConfirmModalProps) {
    return (
        <>
            <Form onSubmit={(e) => {
                e.preventDefault();
                onDelete(new FormData(e.currentTarget));
            }}>
                <Text>
                    Are you sure you want to remove tracking for this game on <b>{platform}</b>?
                    This is an irreversable action!
                </Text>
                <TextInput name={"gameRemoteId"} defaultValue={game.remoteId} hidden={true}/>
                <TextInput name={"platform"} defaultValue={platform} hidden={true}/>
                <Group position={"right"} mt={32}>
                    <Button variant={"outline"} onClick={onCancel}>Cancel</Button>
                    <Button color={"red"} type={"submit"} onClick={onConfirm}>Yes, I am sure</Button>
                </Group>
            </Form>
        </>
    );
}

export function showDeleteConfirmModal(
    modalsContext: ModalsContextProps,
    game: Game,
    platform: string,
    onDelete: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: "Confirm deletion",
        centered: true,
        children: (
            <DeleteConfirmModal
                game={game}
                platform={platform}
                onCancel={() => modalsContext.closeModal(id)}
                onConfirm={() => {
                    showNotification({
                        title: 'Successfully removed tracked game',
                        message: `Removed ${game.title} for ${platform} from tracking.`,
                        icon: <TrashX size={16}/>,
                        color: "red"
                    });

                    modalsContext.closeAll();
                }}
                onDelete={onDelete}/>
        )
    });
}

export function showTrackGameEditorModal(
    modalsContext: ModalsContextProps,
    game: Game,
    selectedGameTracking: GameTracking | null,
    allGameTrackings: GameTracking[],
    onAdd: (formData: FormData) => void,
    onUpdate: (formData: FormData) => void,
    onDelete: (formData: FormData) => void
) {
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
        ?.filter(value => !allGameTrackings.map(gt => gt.platform).includes(value))
        .map(value => ({ value: value, label: value })) ?? [];

    const gameTrackingsPlatforms = allGameTrackings
        .map(gt => gt.platform ?? "")
        .filter(platform => platform)
        .map(platform => ({ value: platform, label: platform }));

    const id = modalsContext.openModal({
        title: selectedGameTracking ? "Edit tracked game" : "Add tracked game",
        centered: true,
        children: (
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
                        defaultValue={selectedGameTracking?.platform ?? availableGamePlatforms[0].value}
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
                            <Button color={"red"}
                                    onClick={() => showDeleteConfirmModal(
                                        modalsContext,
                                        game,
                                        selectedGameTracking?.platform ?? "",
                                        onDelete)}
                            >
                                Remove
                            </Button>}
                    </Group>
                    <Group position={"right"}>
                        <Button variant={"outline"} onClick={() => modalsContext.closeModal(id)}>Cancel</Button>
                        <Button type={"submit"} onClick={() => {
                            if (selectedGameTracking) {
                                showNotification({
                                    title: 'Successfully updated tracked game',
                                    message: `Updated ${game.title} for ${selectedGameTracking.platform}.`,
                                    icon: <Pencil size={16}/>,
                                    color: "green"
                                });
                            } else {
                                showNotification({
                                    title: 'Successfully added tracked game',
                                    message: `Added ${game.title} for tracking.`,
                                    icon: <PlaylistAdd size={16}/>,
                                    color: "green"
                                });
                            }

                            modalsContext.closeAll();
                        }}>
                            {selectedGameTracking ? "Save" : "Add"}
                        </Button>
                    </Group>
                </Group>
            </Form>
        )
    });
}

export function showGameTrackingsSelectorModal(
    modalsContext: ModalsContextProps,
    game: GetGameResult,
    gameTrackings: GetGameTrackingsItemResult[],
    onAdd: (formData: FormData) => void,
    onUpdate: (formData: FormData) => void,
    onDelete: (formData: FormData) => void,
) {
    const id = modalsContext.openModal({
        title: "Select tracking to edit",
        centered: true,
        children: (
            <Stack>
                {gameTrackings.map(gt => (
                    <Card onClick={() => showTrackGameEditorModal(
                        modalsContext,
                        game,
                        gt,
                        gameTrackings,
                        onAdd,
                        onUpdate,
                        onDelete)}
                          sx={theme => ({
                              '&:hover': {
                                  backgroundColor: theme.colors.gray[8],
                                  cursor: "pointer"
                              },
                          })}>
                        <Title order={5}>{gt.platform}</Title>
                    </Card>
                ))}
            </Stack>
        )
    });
}