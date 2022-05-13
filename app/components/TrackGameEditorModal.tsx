import { GetTrackedGameResult, TrackedGameFormat, TrackedGameOwnership, TrackedGameStatus } from "backend";
import { Button, Group, Modal, NumberInput, Select, TextInput } from "@mantine/core";
import { Form } from "@remix-run/react";

interface TrackGameEditorModalProps {
    opened: boolean;
    onModalClosed: () => void;
    gameRemoteId: number;
    platforms: string[];
    trackedGame: GetTrackedGameResult | null;
}

export default function TrackGameEditorModal({ opened, onModalClosed, gameRemoteId, platforms, trackedGame }: TrackGameEditorModalProps) {
    const gameStatuses = Object.keys(TrackedGameStatus)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const gameFormats = Object.keys(TrackedGameFormat)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const gameOwnerships = Object.keys(TrackedGameOwnership)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const gamePlatforms = platforms.map(value => ({ value: value, label: value }))
    
    return (
        <Modal centered opened={opened} onClose={onModalClosed}
               title={"Track game editor"} >
            <Form action={"/home/games/track/add"} method={"post"}>
                <TextInput name="gameRemoteId" hidden defaultValue={gameRemoteId} />
                <NumberInput name="hoursPlayed" label="Hours played" defaultValue={trackedGame?.hoursPlayed ?? 0}/>
                <Select name="platform" defaultValue={trackedGame?.platform ?? gamePlatforms[0].value} mt={16} label="Platform" data={gamePlatforms}/>
                <Select name="status" defaultValue={trackedGame?.status?.toString() ?? gameStatuses[0].value} mt={16} label="Status" data={gameStatuses}/>
                <Select name="format" defaultValue={trackedGame?.format?.toString() ?? gameFormats[0].value} mt={16} label="Format" data={gameFormats}/>
                <Select name="ownership" defaultValue={trackedGame?.ownership?.toString() ?? gameOwnerships[0].value} mt={16} label="Ownership" data={gameOwnerships}/>
                <Group position={"right"} mt={32}>
                    <Button color={"red"} onClick={onModalClosed}>Discard</Button>
                    <Button type={"submit"}>Save</Button>
                </Group>
            </Form>
        </Modal>
    );
}