import { Card, Group, Image, Stack, Text, Title } from "@mantine/core";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import { Link } from "@remix-run/react";
import { MoodSad } from "tabler-icons-react";

interface User {
    userName: string;
    profilePictureURL: string;
}

interface UserFollowListModalProps {
    users: User[];
    onUserClick: () => void;
}

function UserFollowListModal({ users, onUserClick }: UserFollowListModalProps) {
    return (
        <Stack>
            {users.length === 0 &&
                <Stack py={32} align="center" sx={(theme) => ({
                    color: theme.colors.gray[7]
                })}>
                    <MoodSad size={48}/>
                    <Text align="center">No one here</Text>
                </Stack>
            }
            {users.map(u => (
                <Link to={`/home/members/${u.userName}`} style={{ textDecoration: "none" }} onClick={onUserClick}>
                    <Card>
                        <Group align={"end"}>
                            <Image src={u.profilePictureURL ?? "/default_user.svg"} radius={25} width={25} height={25}/>

                            <Stack ml={8}>
                                <Title order={5}>{u.userName}</Title>
                            </Stack>
                        </Group>
                    </Card>
                </Link>
            ))}
        </Stack>
    );
}

export function showUserFollowListModal(
    modalsContext: ModalsContextProps,
    users: User[],
    type: "Followers" | "Followings"
) {
    const id = modalsContext.openModal({
        title: type,
        centered: true,
        overflow: "inside",
        children: (
            <UserFollowListModal users={users} onUserClick={() => modalsContext.closeAll()} />
        )
    });
}