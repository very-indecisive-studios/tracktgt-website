import { Card, Container, Group, Image, Stack, Text, Title } from "@mantine/core";
import { json, LoaderFunction } from "@remix-run/node";
import { backendAPIClientInstance, SearchUsersItemResult } from "backend";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import Motion from "~/components/home/Motion";

//region Server

interface LoaderData {
    items: SearchUsersItemResult[]
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const title = url.searchParams.get("title");

    const backendResult = await backendAPIClientInstance.user_SearchUsers(title);

    return json<LoaderData>({
        items: backendResult.result.items
    });
}

//endregion

//region Client

interface SearchResultItemProps {
    userName: string;
    profilePictureURL: string;
    bio: string;
}

function SearchResultItem({ userName, profilePictureURL, bio }: SearchResultItemProps) {
    return (
        <div style={{ width: "100%", margin: 'auto' }}>
            <Link to={`/home/members/${userName}`} style={{ textDecoration: "none" }}>
                <Card shadow="xs" p="lg">
                    <Group align={"end"}>
                        <Image src={profilePictureURL ?? "/default_user.svg"} radius={100} width={100} height={100}/>

                        <Stack ml={8}>
                            <Title order={3}>{userName}</Title>
                            <Text>{bio ?? <i>{userName} has not provided any description yet.</i>}</Text>
                        </Stack>
                    </Group>
                </Card>
            </Link>
        </div>
    );
}

export default function Search() {
    const loaderData = useLoaderData<LoaderData>();
    const [searchParams, _] = useSearchParams();
    const title = searchParams.get("title");

    return (
        <Motion>
            <Container py={16}>
                <Title mb={32} order={2}>Search results for "{title}"</Title>
                <Stack>
                    {loaderData.items.map(s => (
                        <SearchResultItem key={s.userName}
                                        userName={s.userName}
                                        profilePictureURL={s.profilePictureURL}
                                        bio={s.bio}
                        />
                    ))}
                </Stack>
            </Container>
        </Motion>
    );
}

//endregion
