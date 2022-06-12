import { Form } from "@remix-run/react";
import { Button, Group, Text } from "@mantine/core";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import { showNotification } from "@mantine/notifications";
import { TrashX } from "tabler-icons-react";

interface Book {
    title?: string | undefined;
    remoteId?: string | undefined;
}

interface BookWishlistRemoveConfirmModalProps {
    book: Book;
    onCancel: () => void;
    onConfirm: () => void;
    onRemove: () => void;
}

function BookWishlistRemoveConfirmModal({ book, onCancel, onConfirm, onRemove }: BookWishlistRemoveConfirmModalProps) {
    return (
        <>
            <Form onSubmit={(e) => {
                e.preventDefault();
                onRemove();
            }}>
                <Text>
                    Are you sure you want to remove wishlist for {book.title}?
                </Text>
                <Group position={"right"} mt={32}>
                    <Button variant={"outline"} onClick={onCancel}>Cancel</Button>
                    <Button color={"red"} type={"submit"} onClick={onConfirm}>Yes, I am sure</Button>
                </Group>
            </Form>
        </>
    );
}

export function showBookWishlistRemoveConfirmModal(
    modalsContext: ModalsContextProps,
    book: Book,
    onRemove: () => void
) {
    const id = modalsContext.openModal({
        title: "Confirm deletion",
        centered: true,
        children: (
            <BookWishlistRemoveConfirmModal
                book={book}
                onCancel={() => modalsContext.closeModal(id)}
                onConfirm={() => {
                    showNotification({
                        title: 'Successfully removed wishlisted game',
                        message: `Removed ${book.title} from wishlist.`,
                        icon: <TrashX size={16}/>,
                        color: "red"
                    });

                    modalsContext.closeAll();
                }}
                onRemove={onRemove}/>
        )
    });
}
