import { Form } from "@remix-run/react";
import { ActionIcon, Button, Card, Divider, Group, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import { TrashX } from "tabler-icons-react";

interface Game {
    title?: string;
    remoteId?: number;
    platforms?: string[];
}

interface GameWishlist {
    platform?: string;
}

interface GameWishlistRemoveConfirmModalProps {
    game: Game;
    platform: string;
    onCancel: () => void;
    onRemove: (formData: FormData) => void;
}

function GameWishlistRemoveConfirmModal({ game, platform, onCancel, onRemove }: GameWishlistRemoveConfirmModalProps) {
    return (
        <>
            <Form onSubmit={(e) => {
                e.preventDefault();
                onRemove(new FormData(e.currentTarget));
            }}>
                <Text>
                    Are you sure you want to remove wishlist for {game.title} on <b>{platform}</b>?
                    This is an irreversable action!
                </Text>
                <TextInput name={"platform"} defaultValue={platform} hidden={true}/>
                <Group position={"right"} mt={32}>
                    <Button variant={"outline"} onClick={onCancel}>Cancel</Button>
                    <Button color={"red"} type={"submit"}>Yes, I am sure</Button>
                </Group>
            </Form>
        </>
    );
}

export function showGameWishlistRemoveConfirmModal(
    modalsContext: ModalsContextProps,
    game: Game,
    platform: string,
    onRemove: (formData: FormData) => void
) {
    const id = modalsContext.openModal({
        title: "Confirm deletion",
        centered: true,
        children: (
            <GameWishlistRemoveConfirmModal
                game={game}
                platform={platform}
                onCancel={() => modalsContext.closeModal(id)}
                onRemove={(formData) => {
                    onRemove(formData);
                    
                    modalsContext.closeAll();
                }}/>
        )
    });
}

interface GameWishlistEditorModalProps {
    availablePlatformsToWishlist: string[];
    onAdd: (formData: FormData) => void;
    onCancel: () => void;
}

function GameWishlistEditorModal({ availablePlatformsToWishlist, onAdd, onCancel }: GameWishlistEditorModalProps) {
    return (
        <Form onSubmit={(e) => {
            e.preventDefault();

            onAdd(new FormData(e.currentTarget));
        }}>
            <Select name="platform"
                    label="Platform"
                    my={16}
                    defaultValue={availablePlatformsToWishlist[0]}
                    data={availablePlatformsToWishlist}/>
            <Group position={"right"}>
                <Button type={"submit"}>Add</Button>
            </Group>
        </Form>
    );
}

export function showGameWishlistEditorModal(
    modalsContext: ModalsContextProps,
    game: Game,
    gameWishlists: GameWishlist[],
    onAdd: (formData: FormData) => void,
) {
    const availableGamePlatforms = game.platforms
        ?.filter(value => !gameWishlists.map(gw => gw.platform).includes(value)) ?? [];

    const id = modalsContext.openModal({
        title: "Add to wishlist",
        centered: true,
        children: (
            <GameWishlistEditorModal 
                availablePlatformsToWishlist={availableGamePlatforms} 
                onAdd={(platform) => {
                    onAdd(platform);
                    modalsContext.closeAll();
                }}
                onCancel={() => modalsContext.closeAll()} />
        )
    });
}

export function showGameWishlistManageModal(
    modalsContext: ModalsContextProps,
    game: Game,
    gameWishlists: GameWishlist[],
    onAdd: (formData: FormData) => void,
    onRemove: (formData: FormData) => void,
) {
    const id = modalsContext.openModal({
        title: "Manage your wishlist",
        centered: true,
        children: (
            <Stack>
                <Stack>
                    {gameWishlists.map(gw => (
                        <Card>
                            <Group>
                                <Title order={5}>{gw.platform}</Title>
                                <ActionIcon 
                                    onClick={() => showGameWishlistRemoveConfirmModal(modalsContext, game, gw.platform ?? "", onRemove)}
                                    sx={() => ({
                                      marginLeft: "auto"  
                                    })}>
                                    <TrashX color={"red"} />
                                </ActionIcon>
                            </Group>
                        </Card>
                    ))}
                </Stack>
                {(gameWishlists.length < (game.platforms?.length ?? 0)) &&
                    <>
                        <Divider my="xs" label="Or" labelPosition="center" />
                        <Button fullWidth onClick={() => showGameWishlistEditorModal(modalsContext, game, gameWishlists, onAdd)}>
                            Add another platform to wishlist
                        </Button>
                    </>
                }
            </Stack>
        )
    });
}