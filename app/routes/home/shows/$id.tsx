import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import React, { useEffect } from "react";
import { Box, Button, Container, Group, Image, MediaQuery, Stack, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useModals } from "@mantine/modals";
import { Edit, Pencil, PlaylistAdd, Plus, TrashX } from "tabler-icons-react";
import { requireUserId } from "~/utils/session.server";
import CoverImage from "~/components/home/CoverImage";
import { showShowTrackingEditorModal } from "~/components/home/shows/ShowTrackingModals";
import { useShowTracking } from "~/routes/home/shows/track/$showId";
import {
    backendAPIClientInstance,
    GetShowResult,
    ShowType,
} from "backend";

//region Server

interface LoaderData {
    show: GetShowResult;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);

    const showId: string = params.id ?? "0";

    const getShowResponse = await backendAPIClientInstance.show_GetShow(showId);

    return json<LoaderData>({
        show: getShowResponse.result
    });
}

//endregion

//region Client

interface Show {
    remoteId: string;
    coverImageURL: string;
    title: string;
    showType: ShowType;
}

interface TrackingButtonProps {
    show: Show;
}

function TrackingButton({ show }: TrackingButtonProps) {
    const modals = useModals();

    const { tracking, addTracking, updateTracking, removeTracking, actionDone, isLoading }
        = useShowTracking(show.remoteId ?? "");
    
    // Action notifications
    useEffect(() => {
        if (actionDone == "add") {
            showNotification({
                title: 'Successfully added show to tracking.',
                message: `Your changes have been saved.`,
                icon: <PlaylistAdd size={16}/>,
                color: "green"
            });
        } else if (actionDone == "update") {
            showNotification({
                title: 'Successfully updated show tracking.',
                message: `Your changes have been saved.`,
                icon: <Pencil size={16}/>,
                color: "green"
            });
        } else if (actionDone == "remove") {
            showNotification({
                title: 'Successfully removed show tracking.',
                message: `Your changes have been saved.`,
                icon: <TrashX size={16}/>,
                color: "red"
            });
        }
    }, [actionDone]);
    
    const onClick = () => {
        showShowTrackingEditorModal(
            modals,
            show,
            tracking,
            addTracking,
            updateTracking,
            removeTracking,
        );
    };
    
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

interface ShowHeaderProps {
    show: Show;
}

export function ShowHeader({ show }: ShowHeaderProps) {
    return (
        <>
            <Stack mr={12}>
                <CoverImage src={show.coverImageURL} width={200} height={300}/>

                <TrackingButton show={show} />
            </Stack>

            <Stack spacing={"xs"}>
                <Title order={1}>
                    {show.title}
                </Title>

                <Title order={4} sx={(theme) => ({
                    color: theme.colors.gray[6],
                })}>
                    {(ShowType[show.showType])}
                </Title>
            </Stack>
        </>
    );
}

export default function Show() {
    const loaderData = useLoaderData<LoaderData>();
    const modals = useModals();
    const submit = useSubmit();

    const showHeader = <ShowHeader show={loaderData.show}/>

    return (
        <Container py={16} sx={() => ({
            position: "relative"
        })}>
            <Box sx={() => ({
                position: "absolute",
                top: "0",
                left: "0",
                height: "300px",
                width: "100%",
            })}>
                <Image radius={"sm"} src={loaderData.show.coverImageURL} height={300} sx={() => ({
                    filter: "brightness(0.4)"
                })} />
            </Box>
            
            <MediaQuery styles={{ display: "none" }} largerThan={"sm"}>
                <Stack mt={128}>
                    {showHeader}
                </Stack>
            </MediaQuery>

            <MediaQuery styles={{ display: "none" }} smallerThan={"sm"}>
                <Group mt={128} align={"end"} noWrap>
                    {showHeader}
                </Group>
            </MediaQuery>

            <Stack mt={48}>
                <Title order={2}>Summary</Title>
                <Text
                    sx={(theme) => ({ color: theme.colors.gray[6] })}>{loaderData.show.summary.replace(/<\/?[^>]+(>|$)/g, "")}</Text>
            </Stack>
        </Container>
    );
}

//endregion
