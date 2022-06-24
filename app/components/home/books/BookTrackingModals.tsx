import { Form } from "@remix-run/react";
import { Button, Group, NumberInput, Select, Text } from "@mantine/core";
import {
    BookTrackingFormat,
    BookTrackingOwnership,
    BookTrackingStatus,
} from "backend";
import { ModalsContextProps } from "@mantine/modals/lib/context";

interface Book {
    title: string;
    remoteId: string;
}

interface BookTracking {
    chaptersRead: number;
    format: BookTrackingFormat;
    status: BookTrackingStatus;
    ownership: BookTrackingOwnership;
}

interface BookTrackingRemoveConfirmModalProps {
    book: Book;
    onCancel: () => void;
    onRemove: (formData: FormData) => void;
}

function BookTrackingRemoveConfirmModal({ book, onCancel, onRemove }: BookTrackingRemoveConfirmModalProps) {
    return (
        <>
            <Form onSubmit={(e) => {
                e.preventDefault();
                onRemove(new FormData(e.currentTarget));
            }}>
                <Text>
                    Are you sure you want to remove tracking for {book.title}?
                    This is an irreversable action!
                </Text>
                <Group position={"right"} mt={32}>
                    <Button variant={"outline"} onClick={onCancel}>Cancel</Button>
                    <Button color={"red"} type={"submit"}>Yes, I am sure</Button>
                </Group>
            </Form>
        </>
    );
}

export function showBookTrackingRemoveConfirmModal(
    modalsContext: ModalsContextProps,
    book: Book,
    onRemove: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: "Confirm removal",
        centered: true,
        children: (
            <BookTrackingRemoveConfirmModal
                book={book}
                onCancel={() => modalsContext.closeModal(id)}
                onRemove={(formData) => {
                    onRemove(formData);

                    modalsContext.closeAll();
                }}/>
        )
    });
}

interface BookTrackingEditorModalProps {
    modalsContext: ModalsContextProps;
    book: Book;
    selectedBookTracking: BookTracking | null;
    onUpdate: (formData: FormData) => void;
    onAdd: (formData: FormData) => void;
    onRemove: (formData: FormData) => void;
}

function BookTrackingEditorModal({
                                     modalsContext,
                                     book,
                                     selectedBookTracking,
                                     onUpdate,
                                     onAdd,
                                     onRemove
                                 }: BookTrackingEditorModalProps) {
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

    return (
        <Form onSubmit={(e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);

            if (selectedBookTracking) {
                onUpdate(formData);
            } else {
                onAdd(formData);
            }
        }}>
            <NumberInput name="chaptersRead" label="Chapters read"
                         defaultValue={selectedBookTracking?.chaptersRead ?? 0}/>
            <Select name="status"
                    label="Status"
                    mt={16}
                    defaultValue={selectedBookTracking?.status.toString() ?? bookStatuses[0].value}
                    data={bookStatuses}/>
            <Select name="format"
                    label="Format"
                    mt={16}
                    defaultValue={selectedBookTracking?.format.toString() ?? bookFormats[0].value}
                    data={bookFormats}/>
            <Select name="ownership"
                    label="Ownership"
                    mt={16}
                    defaultValue={selectedBookTracking?.ownership.toString() ?? bookOwnerships[0].value}
                    data={bookOwnerships}/>
            <Group mt={32} grow>
                <Group position={"left"}>
                    {selectedBookTracking &&
                        <Button color={"red"}
                                onClick={() => showBookTrackingRemoveConfirmModal(modalsContext, book, onRemove)}>
                            Remove
                        </Button>}
                </Group>
                <Group position={"right"}>
                    <Button type={"submit"}>
                        {selectedBookTracking ? "Save" : "Add"}
                    </Button>
                </Group>
            </Group>
        </Form>
    );
}

export function showBookTrackingEditorModal(
    modalsContext: ModalsContextProps,
    book: Book,
    selectedBookTracking: BookTracking | null,
    onAdd: (formData: FormData) => void,
    onUpdate: (formData: FormData) => void,
    onRemove: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: selectedBookTracking ? "Edit book tracking" : "Add book tracking",
        centered: true,
        children: (
            <BookTrackingEditorModal
                modalsContext={modalsContext}
                book={book}
                selectedBookTracking={selectedBookTracking}
                onUpdate={(formData) => {
                    onUpdate(formData);

                    modalsContext.closeAll();
                }}
                onAdd={(formData) => {
                    onAdd(formData);

                    modalsContext.closeAll();
                }}
                onRemove={(formData) => {
                    onRemove(formData);

                    modalsContext.closeAll();
                }}
            />
        )
    });
}
