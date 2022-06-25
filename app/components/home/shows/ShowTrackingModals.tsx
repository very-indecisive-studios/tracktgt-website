import { Form } from "@remix-run/react";
import { Button, Group, NumberInput, Select, Text, TextInput } from "@mantine/core";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import { ShowTrackingStatus, ShowType } from "backend";

interface Show {
    title: string;
    remoteId: string;
    showType: ShowType;
}

interface ShowTracking {
    episodesWatched: number;
    status: ShowTrackingStatus;
}

interface ShowTrackingRemoveConfirmModalProps {
    show: Show;
    onCancel: () => void;
    onRemove: (formData: FormData) => void;
}

function ShowTrackingRemoveConfirmModal({ show, onCancel, onRemove }: ShowTrackingRemoveConfirmModalProps) {
    return (
        <>
            <Form onSubmit={(e) => {
                e.preventDefault();
                onRemove(new FormData(e.currentTarget));
            }}>
                <Text>
                    Are you sure you want to remove tracking for {show.title}?
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

function showShowTrackingRemoveConfirmModal(
    modalsContext: ModalsContextProps,
    show: Show,
    onRemove: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: "Confirm removal",
        centered: true,
        children: (
            <ShowTrackingRemoveConfirmModal
                show={show}
                onCancel={() => {
                    modalsContext.closeModal(id);
                }}
                onRemove={(formData) => {
                    onRemove(formData);

                    modalsContext.closeAll();
                }}/>
        )
    });
}

interface ShowTrackingEditorModalProps {
    modalsContext: ModalsContextProps;
    show: Show;
    selectedShowTracking: ShowTracking | null;
    onAdd: (formData: FormData) => void;
    onUpdate: (formData: FormData) => void;
    onRemove: (formData: FormData) => void;
}

function ShowTrackingEditorModal({
                                     modalsContext,
                                     show,
                                     selectedShowTracking,
                                     onAdd,
                                     onUpdate,
                                     onRemove
                                 }: ShowTrackingEditorModalProps) {
    // Get all statuses, formats and ownerships.
    const showStatuses = Object.keys(ShowTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))

    const showTypes = Object.keys(ShowType)
        .filter((s) => isNaN(Number(s)))
        .map((value, index) => ({ value: index.toString(), label: value }))


    return (
        <Form onSubmit={(e) => {
            e.preventDefault();

            if (selectedShowTracking) {
                onUpdate(new FormData(e.currentTarget));
            } else {
                onAdd(new FormData(e.currentTarget));
            }
        }}>
            <TextInput name="showRemoteId" hidden defaultValue={show.remoteId}/>
            <NumberInput name="episodesWatched"
                         label="Episodes Watched"
                         defaultValue={selectedShowTracking?.episodesWatched ?? 0}
                         max={show.showType == ShowType.Movie ? 1 : 999999}/>
            <Select name="status"
                    label="Status"
                    mt={16}
                    defaultValue={selectedShowTracking?.status.toString() ?? showStatuses[0].value}
                    data={showStatuses}/>
            <Group mt={32} grow>
                <Group position={"left"}>
                    {selectedShowTracking &&
                        <Button color={"red"}
                                onClick={() => showShowTrackingRemoveConfirmModal(
                                    modalsContext,
                                    show,
                                    onRemove
                                )}>
                            Remove
                        </Button>}
                </Group>
                <Group position={"right"}>
                    <Button type={"submit"}>
                        {selectedShowTracking ? "Save" : "Add"}
                    </Button>
                </Group>
            </Group>
        </Form>
    );
}

export function showShowTrackingEditorModal(
    modalsContext: ModalsContextProps,
    show: Show,
    selectedShowTracking: ShowTracking | null,
    onAdd: (formData: FormData) => void,
    onUpdate: (formData: FormData) => void,
    onRemove: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: selectedShowTracking ? "Edit show tracking" : "Add show tracking",
        centered: true,
        children: (
            <ShowTrackingEditorModal modalsContext={modalsContext} 
                                     show={show}
                                     selectedShowTracking={selectedShowTracking} 
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
                                     }} />
        )
    });
}
