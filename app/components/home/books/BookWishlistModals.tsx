import { Form } from "@remix-run/react";
import { Button, Group, Text } from "@mantine/core";
import { ModalsContextProps } from "@mantine/modals/lib/context";

interface Book {
    title: string;
    remoteId: string;
}

interface BookWishlistRemoveConfirmModalProps {
    book: Book;
    onCancel: () => void;
    onRemove: (formData: FormData) => void;
}

function BookWishlistRemoveConfirmModal({ book, onCancel, onRemove }: BookWishlistRemoveConfirmModalProps) {
    return (
        <>
            <Form onSubmit={(e) => {
                e.preventDefault();
                onRemove(new FormData(e.currentTarget));
            }}>
                <Text>
                    Are you sure you want to remove wishlist for {book.title}?
                </Text>
                <Group position={"right"} mt={32}>
                    <Button variant={"outline"} onClick={onCancel}>Cancel</Button>
                    <Button color={"red"} type={"submit"}>Yes, I am sure</Button>
                </Group>
            </Form>
        </>
    );
}

export function showBookWishlistRemoveConfirmModal(
    modalsContext: ModalsContextProps,
    book: Book,
    onRemove: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: "Confirm removal",
        centered: true,
        children: (
            <BookWishlistRemoveConfirmModal
                book={book}
                onCancel={() => modalsContext.closeModal(id)}
                onRemove={(formData) => {
                    onRemove(formData);
                    
                    modalsContext.closeAll();
                }}/>
        )
    });
}
