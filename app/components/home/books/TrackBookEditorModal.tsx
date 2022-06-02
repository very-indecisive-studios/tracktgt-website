import { Form } from "@remix-run/react";
import { Button, Group, NumberInput, Select, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Pencil, PlaylistAdd, TrashX } from "tabler-icons-react";
import {
    BookTrackingFormat, 
    BookTrackingOwnership, 
    BookTrackingStatus,
} from "backend";
import { ModalsContextProps } from "@mantine/modals/lib/context";

interface Book {
    title?: string;
    remoteId?: string;
}

interface BookTracking {
    chaptersRead?: number;
    format?: BookTrackingFormat;
    status?: BookTrackingStatus;
    ownership?: BookTrackingOwnership;
}

function showDeleteConfirmModal(
    modalsContext: ModalsContextProps,
    book: Book,
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
                    Are you sure you want to remove tracking for <b>{book.title ?? "this book"}</b>?
                    This is an irreversable action!
                </Text>
                <TextInput name={"bookRemoteId"} defaultValue={book.remoteId} hidden={true}/>
                <Group position={"right"} mt={32}>
                    <Button variant={"outline"} onClick={() => modalsContext.closeModal(id)}>
                        Cancel
                    </Button>
                    <Button color={"red"} type={"submit"} onClick={() => {
                        showNotification({
                            title: 'Successfully removed tracked book',
                            message: `Removed ${book.title} from tracking.`,
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

export function showTrackBookEditorModal(
    modalsContext: ModalsContextProps,
    book: Book,
    selectedBookTracking: BookTracking | null,
    onAdd: (formData: FormData) => void,
    onUpdate: (formData: FormData) => void,
    onDelete: (formData: FormData) => void
) {
    // Get all statuses, formats and ownerships.
    const bookStatuses = Object.keys(BookTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const bookFormats = Object.keys(BookTrackingFormat)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const bookOwnerships = Object.keys(BookTrackingOwnership)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const id = modalsContext.openModal({
        title: selectedBookTracking ? "Edit tracked book" : "Add tracked book",
        centered: true,
        children: (
            <Form onSubmit={(e) => {
                e.preventDefault();

                if (selectedBookTracking) {
                    onUpdate(new FormData(e.currentTarget));
                } else {
                    onAdd(new FormData(e.currentTarget));
                }
            }}>
                <TextInput name="bookRemoteId" hidden defaultValue={book.remoteId}/>
                <NumberInput name="chaptersRead" label="Chapters read"
                             defaultValue={selectedBookTracking?.chaptersRead ?? 0}/>
                <Select name="status"
                        label="Status"
                        mt={16}
                        defaultValue={selectedBookTracking?.status?.toString() ?? bookStatuses[0].value}
                        data={bookStatuses}/>
                <Select name="format"
                        label="Format"
                        mt={16}
                        defaultValue={selectedBookTracking?.format?.toString() ?? bookFormats[0].value}
                        data={bookFormats}/>
                <Select name="ownership"
                        label="Ownership"
                        mt={16}
                        defaultValue={selectedBookTracking?.ownership?.toString() ?? bookOwnerships[0].value}
                        data={bookOwnerships}/>
                <Group mt={32} grow>
                    <Group position={"left"}>
                        {selectedBookTracking &&
                            <Button color={"red"}
                                    onClick={() => showDeleteConfirmModal(
                                        modalsContext,
                                        book,
                                        onDelete)}>
                                Remove
                            </Button>}
                    </Group>
                    <Group position={"right"}>
                        <Button type={"submit"} onClick={() => {
                            if (selectedBookTracking) {
                                showNotification({
                                    title: 'Successfully updated tracked book',
                                    message: `Updated tracking for ${book.title}.`,
                                    icon: <Pencil size={16}/>,
                                    color: "green"
                                });
                            } else {
                                showNotification({
                                    title: 'Successfully added tracked book',
                                    message: `Added ${book.title} for tracking.`,
                                    icon: <PlaylistAdd size={16}/>,
                                    color: "green"
                                });
                            }

                            modalsContext.closeAll();
                        }}>
                            {selectedBookTracking ? "Save" : "Add"}
                        </Button>
                    </Group>
                </Group>
            </Form>
        )
    });
}
