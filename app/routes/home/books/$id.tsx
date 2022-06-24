import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData} from "@remix-run/react";
import React, { useEffect } from "react";
import { showNotification } from "@mantine/notifications";
import { Button, Container, Group, MediaQuery, Stack, Text, Title, } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { Edit, Pencil, PlaylistAdd, Plus, Star, StarOff, TrashX } from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import CoverImage from "~/components/home/CoverImage";
import { showBookWishlistRemoveConfirmModal } from "~/components/home/books/BookWishlistModals";
import { showBookTrackingEditorModal } from "~/components/home/books/BookTrackingModals";
import { useBookWishlist } from "~/routes/home/books/wishlist/$id";
import { useBookTracking } from "~/routes/home/books/track/$id";
import {
    backendAPIClientInstance,
    GetBookResult,
} from "backend";

//region Server

interface LoaderData {
    book: GetBookResult;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);
    
    const bookId: string = params.id ?? "0";

    const getBookResponse = await backendAPIClientInstance.book_GetBook(bookId);
    const book = getBookResponse.result;

    return json<LoaderData>({
        book: book
    });
}

//endregion

//region Client

interface Book {
    remoteId: string; 
    coverImageURL: string;
    title: string;
    authors: string[];
}

interface TrackingButtonProps {
    book: Book;
}

function TrackingButton({ book }: TrackingButtonProps) {
    const modals = useModals();

    const { tracking, addTracking, updateTracking, removeTracking, actionDone, isLoading } 
        = useBookTracking(book.remoteId);

    // Action notifications
    useEffect(() => {
        if (actionDone == "add") {
            showNotification({
                title: 'Successfully added book to tracking.',
                message: `Your changes have been saved.`,
                icon: <PlaylistAdd size={16}/>,
                color: "green"
            });
        } else if (actionDone == "update") {
            showNotification({
                title: 'Successfully updated book tracking.',
                message: `Your changes have been saved.`,
                icon: <Pencil size={16}/>,
                color: "green"
            });
        } else if (actionDone == "remove") {
            showNotification({
                title: 'Successfully removed book tracking.',
                message: `Your changes have been saved.`,
                icon: <TrashX size={16}/>,
                color: "red"
            });
        }
    }, [actionDone]);
    
    const onClick = () => showBookTrackingEditorModal(
        modals,
        book,
        tracking,
        addTracking,
        updateTracking,
        removeTracking,
    );
    
    return (
        <>
            {
                (!tracking) ?
                    <Button color={"indigo"}
                            onClick={onClick}
                            leftIcon={<Plus size={20}/>}
                            loading={isLoading}>
                        Add tracking
                    </Button> :
                    <Button color={"orange"}
                            onClick={onClick}
                            leftIcon={<Edit size={20}/>}
                            loading={isLoading}>
                        Manage tracking
                    </Button>
            }
        </>
    );
}

interface WishlistButtonProps {
    book: Book;
}

function WishlistButton({ book }: WishlistButtonProps) {
    const modals = useModals();
    
    const { hasWishlist, addToWishlist, removeFromWishlist, actionDone, isLoading } 
        = useBookWishlist(book.remoteId);

    // Action notifications
    useEffect(() => {
        if (actionDone == "add") {
            showNotification({
                title: 'Successfully added book to wishlist.',
                message: `Your changes have been saved.`,
                icon: <Star size={16}/>,
                color: "yellow"
            });
        } else if (actionDone == "remove") {
            showNotification({
                title: 'Successfully removed book from wishlist.',
                message: `Your changes have been saved.`,
                icon: <StarOff size={16}/>,
                color: "red"
            });
        }
    }, [actionDone]);
    
    return (
        <>
            {
                (!hasWishlist) ?
                    <Button color={"yellow"}
                            onClick={() => addToWishlist(new FormData())}
                            leftIcon={<Star size={20}/>}
                            loading={isLoading}>
                        Add to wishlist
                    </Button> :
                    <Button color={"yellow"}
                            variant={"outline"}
                            onClick={() => showBookWishlistRemoveConfirmModal(modals, book, removeFromWishlist)}
                            leftIcon={<Star size={20}/>}
                            loading={isLoading}>
                        Remove from wishlist
                    </Button>
            }
        </>
    );
}

interface BookHeaderProps {
    book: Book;
}

export function BookHeader({ book }: BookHeaderProps) {
    return (
        <>
            <Stack mr={12}>
                <CoverImage src={book.coverImageURL} width={200} height={300}/>
                <TrackingButton book={book} />
                <WishlistButton book={book} />
            </Stack>

            <Stack spacing={"xs"}>
                <Title order={1}>
                    {book.title}
                </Title>

                <Title order={4} sx={(theme) => ({
                    color: theme.colors.gray[6],
                })}>
                    {book.authors.join(", ")}
                </Title>
            </Stack>
        </>
    );
}

export default function Book() {
    const loaderData = useLoaderData<LoaderData>();

    const bookHeader = <BookHeader book={loaderData.book} />

    return (
        <Container py={16}>
            <MediaQuery styles={{ display: "none" }} largerThan={"sm"}>
                <Stack>
                    {bookHeader}
                </Stack>
            </MediaQuery>

            <MediaQuery styles={{ display: "none" }} smallerThan={"sm"}>
                <Group align={"end"} noWrap>
                    {bookHeader}
                </Group>
            </MediaQuery>

            <Stack mt={48}>
                <Title order={2}>Summary</Title>
                <Text
                    sx={(theme) => ({ color: theme.colors.gray[6] })}>{loaderData.book.summary.replace(/<\/?[^>]+(>|$)/g, "")}</Text>
            </Stack>
        </Container>
    );
}

//endregion
