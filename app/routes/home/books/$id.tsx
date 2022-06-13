import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData} from "@remix-run/react";
import { Button, Container, Group, MediaQuery, Stack, Text, Title, } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { Edit, Plus, Star } from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import CoverImage from "~/components/home/CoverImage";
import { showBookWishlistRemoveConfirmModal } from "~/components/home/books/BookWishlistModals";
import { useBookWishlist } from "~/routes/home/books/wishlist/$id";
import {
    backendAPIClientInstance,
    GetBookResult,
} from "backend";
import { useBookTracking } from "~/routes/home/books/track/$id";
import { showBookTrackingEditorModal } from "~/components/home/books/BookTrackingModals";

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

interface Book {
    remoteId?: string | undefined; 
    coverImageURL?: string | undefined;
    title?: string | undefined;
    authors?: string[] | undefined;
}

interface TrackingButtonProps {
    book: Book;
}

function TrackingButton({ book }: TrackingButtonProps) {
    const modals = useModals();

    const { tracking, addTracking, updateTracking, removeTracking, isLoading } 
        = useBookTracking(book.remoteId ?? "");

    return (
        <>
            {
                (!tracking) ?
                    <Button color={"indigo"}
                            onClick={() => showBookTrackingEditorModal(
                                modals, 
                                book, 
                                null, 
                                addTracking,
                                () => {},
                                () => {},
                            )}
                            leftIcon={<Plus size={20}/>}
                            loading={isLoading}>
                        Add tracking
                    </Button> :
                    <Button color={"orange"}
                            onClick={() => showBookTrackingEditorModal(
                                modals,
                                book,
                                tracking,
                                () => {},
                                updateTracking,
                                removeTracking,
                            )}
                            leftIcon={<Edit size={20}/>}
                            loading={isLoading}>
                        Edit tracking
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
    
    const { hasWishlist, addToWishlist, removeFromWishlist, isLoading } = useBookWishlist(book.remoteId ?? "");

    return (
        <>
            {
                (!hasWishlist) ?
                    <Button color={"yellow"}
                            onClick={addToWishlist}
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
                    {book.authors?.join(", ")}
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
                    sx={(theme) => ({ color: theme.colors.gray[6] })}>{loaderData.book.summary?.replace(/<\/?[^>]+(>|$)/g, "")}</Text>
            </Stack>
        </Container>
    );
}