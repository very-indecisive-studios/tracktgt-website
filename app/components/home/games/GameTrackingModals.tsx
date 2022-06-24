import { Form } from "@remix-run/react";
import { Button, Card, Divider, Group, NumberInput, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { Plus } from "tabler-icons-react";
import {
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus,
} from "backend";
import { ModalsContextProps } from "@mantine/modals/lib/context";

interface Game {
    title: string;
    remoteId: number;
    platforms: string[];
}

interface GameTracking {
    platform: string;
    hoursPlayed: number;
    format: GameTrackingFormat;
    status: GameTrackingStatus;
    ownership: GameTrackingOwnership;
}

interface GameTrackingRemoveConfirmModalProps {
    game: Game;
    gameTracking: GameTracking;
    onCancel: () => void;
    onRemove: (formData: FormData) => void;
}

function GameTrackingRemoveConfirmModal({
                                            game,
                                            gameTracking,
                                            onCancel,
                                            onRemove
                                        }: GameTrackingRemoveConfirmModalProps) {
    return (
        <>
            <Form onSubmit={(e) => {
                e.preventDefault();
                onRemove(new FormData(e.currentTarget));
            }}>
                <Text>
                    Are you sure you want to remove tracking for {game.title} on <b>{gameTracking.platform}</b>?
                    This is an irreversable action!
                </Text>
                <TextInput name={"platform"} defaultValue={gameTracking.platform} hidden={true}/>
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
    gameTracking: GameTracking,
    onRemove: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: "Confirm removal",
        centered: true,
        children: (
            <GameTrackingRemoveConfirmModal
                game={game}
                gameTracking={gameTracking}
                onCancel={() => modalsContext.closeModal(id)}
                onRemove={(formData) => {
                    onRemove(formData);

                    modalsContext.closeAll();
                }}/>
        )
    });
}

interface GameTrackingEditorModalProps {
    modalsContext: ModalsContextProps;
    game: Game;
    gameTrackings: GameTracking[];
    selectedGameTracking: GameTracking | null;
    onAdd: (formData: FormData) => void;
    onUpdate: (formData: FormData) => void;
    onRemove: (formData: FormData) => void;
}

function GameTrackingEditorModal({
                                     modalsContext,
                                     game,
                                     gameTrackings,
                                     selectedGameTracking,
                                     onAdd,
                                     onUpdate,
                                     onRemove
                                 }: GameTrackingEditorModalProps) {
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
        .filter(value => !gameTrackings.map(gt => gt.platform).includes(value));

    const gameTrackingsPlatforms = gameTrackings
        .map(gt => gt.platform)

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
                    defaultValue={selectedGameTracking?.status.toString() ?? gameStatuses[0].value}
                    data={gameStatuses}/>
            <Select name="format"
                    label="Format"
                    mt={16}
                    defaultValue={selectedGameTracking?.format.toString() ?? gameFormats[0].value}
                    data={gameFormats}/>
            <Select name="ownership"
                    label="Ownership"
                    mt={16}
                    defaultValue={selectedGameTracking?.ownership.toString() ?? gameOwnerships[0].value}
                    data={gameOwnerships}/>
            <Group mt={32} grow>
                <Group position={"left"}>
                    {selectedGameTracking &&
                        <Button color={"red"} onClick={() => showGameTrackingRemoveConfirmModal(
                            modalsContext,
                            game,
                            selectedGameTracking,
                            onRemove
                        )}>
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
        title: selectedGameTracking ? "Edit game tracking" : "Add game tracking",
        centered: true,
        children: (
            <GameTrackingEditorModal
                modalsContext={modalsContext}
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
                onRemove={(formData) => {
                    onRemove(formData);

                    modalsContext.closeAll();
                }}/>
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
                
                {(gameTrackings.length < game.platforms.length) &&
                    <>
                        <Divider my="xs" label="or" labelProps={{ size: "md" }} labelPosition="center"/>
                        <Button fullWidth
                                leftIcon={<Plus size={20}/>}
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
