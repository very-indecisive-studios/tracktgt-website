import { Form } from "@remix-run/react";
import { Button, Group, NumberInput, Select, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Pencil, PlaylistAdd, TrashX } from "tabler-icons-react";
import {
    ShowTrackingStatus,
    ShowType
} from "backend";
import { ModalsContextProps } from "@mantine/modals/lib/context";

interface Show {
    title?: string;
    remoteId?: number;
}

interface ShowTracking {
    episodesWatched?: number;
    status?: ShowTrackingStatus;
    showType?: ShowType;
}

function showDeleteConfirmModal(
    modalsContext: ModalsContextProps,
    show: Show,
    onDelete: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: "Confirm deletion",
        centered: true,
        children: (
            <Form onSubmit={(e) => {
                e.preventDefault();
                onDelete(new FormData(e.currentTarget));
            }}>
                <Text>
                    Are you sure you want to remove tracking for <b>{show.title ?? "this show"}</b>?
                    This is an irreversable action!
                </Text>
                <TextInput name={"showRemoteId"} defaultValue={show.remoteId} hidden={true}/>
                <Group position={"right"} mt={32}>
                    <Button variant={"outline"} onClick={() => modalsContext.closeModal(id)}>
                        Cancel
                    </Button>
                    <Button color={"red"} type={"submit"} onClick={() => {
                        showNotification({
                            title: 'Successfully removed tracked show',
                            message: `Removed ${show.title} from tracking.`,
                            icon: <TrashX size={16}/>,
                            color: "red"
                        });

                        modalsContext.closeAll();
                    }}>
                        Yes, I am sure
                    </Button>
                </Group>
            </Form>
        )
    });
}

export function showTrackShowEditorModal(
    modalsContext: ModalsContextProps,
    show: Show,
    selectedShowTracking: ShowTracking | null,
    onAdd: (formData: FormData) => void,
    onUpdate: (formData: FormData) => void,
    onDelete: (formData: FormData) => void
) {
    // Get all statuses, formats and ownerships.
    const showStatuses = Object.keys(ShowTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const showTypes = Object.keys(ShowType)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const id = modalsContext.openModal({
        title: selectedShowTracking ? "Edit tracked show" : "Add tracked show",
        centered: true,
        children: (
            <Form onSubmit={(e) => {
                e.preventDefault();

                if (selectedShowTracking) {
                    onUpdate(new FormData(e.currentTarget));
                } else {
                    onAdd(new FormData(e.currentTarget));
                }
            }}>
                <TextInput name="showRemoteId" hidden defaultValue={show.remoteId}/>
                <NumberInput name="chaptersRead" label="Chapters read"
                             defaultValue={selectedShowTracking?.episodesWatched ?? 0}/>
                <Select name="status"
                        label="Status"
                        mt={16}
                        defaultValue={selectedShowTracking?.status?.toString() ?? showStatuses[0].value}
                        data={showStatuses}/>
                <Select name="showType"
                        label="Show Type"
                        mt={16}
                        defaultValue={selectedShowTracking?.showType?.toString() ?? showTypes[0].value}
                        data={showTypes}/>
                <Group mt={32} grow>
                    <Group position={"left"}>
                        {selectedShowTracking &&
                            <Button color={"red"}
                                    onClick={() => showDeleteConfirmModal(
                                        modalsContext,
                                        show,
                                        onDelete)}>
                                Remove
                            </Button>}
                    </Group>
                    <Group position={"right"}>
                        <Button type={"submit"} onClick={() => {
                            if (selectedShowTracking) {
                                showNotification({
                                    title: 'Successfully updated tracked show',
                                    message: `Updated tracking for ${show.title}.`,
                                    icon: <Pencil size={16}/>,
                                    color: "green"
                                });
                            } else {
                                showNotification({
                                    title: 'Successfully added tracked show',
                                    message: `Added ${show.title} for tracking.`,
                                    icon: <PlaylistAdd size={16}/>,
                                    color: "green"
                                });
                            }

                            modalsContext.closeAll();
                        }}>
                            {selectedShowTracking ? "Save" : "Add"}
                        </Button>
                    </Group>
                </Group>
            </Form>
        )
    });
}
