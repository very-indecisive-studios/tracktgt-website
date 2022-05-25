import {
    ActionIcon,
    Center,
    Container,
    Loader,
    Pagination,
    Stack,
    Table,
    Tabs,
    Text,
    Title,
    useMantineTheme
} from "@mantine/core";
import {
    backendAPIClientInstance,
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus,
    GetAllGameTrackingsItemResult, 
    RemoveGameTrackingCommand, 
    UpdateGameTrackingCommand
} from "backend";
import { Link, useFetcher } from "@remix-run/react";
import CoverImage from "~/components/home/games/CoverImage";
import { Check, Clock, Eye, PlayerPause, PlayerPlay } from "tabler-icons-react";
import React, { useEffect, useState } from "react";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { useMobileQuery } from "~/utils/hooks";
import { useModals } from "@mantine/modals";
import { showTrackGameEditorModal } from "~/components/home/games/TrackGameEditorModal";

interface LoaderData {
    items: GetAllGameTrackingsItemResult[],
    page: number,
    totalNoOfPages: number
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);

    let url = new URL(request.url);
    let queryData = {
        page: url.searchParams.get("page"),
        status: url.searchParams.get("status")
    }

    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            page: z.preprocess(preProcessToNumber, z.number()),
            status: z.string()
        });

    const parsedQueryData = formDataSchema.safeParse(queryData);

    if (!parsedQueryData.success) {
        return badRequest(parsedQueryData.error.flatten().fieldErrors);
    }

    const getGameTrackingsBackendAPIResponse = await backendAPIClientInstance.game_GetAllGameTrackings(
        userId,
        GameTrackingStatus[parsedQueryData.data.status as keyof typeof GameTrackingStatus],
        true,
        false,
        false,
        false,
        false,
        parsedQueryData.data.page,
        5
    );

    return json<LoaderData>({
        items: getGameTrackingsBackendAPIResponse.result.items ?? [],
        page: getGameTrackingsBackendAPIResponse.result.page ?? 0,
        totalNoOfPages: getGameTrackingsBackendAPIResponse.result.totalPages ?? 0
    });
}

const handleDelete = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            gameRemoteId: z.preprocess(preProcessToNumber, z.number()),
            platform: z.string(),
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.game_RemoveGameTracking(new RemoveGameTrackingCommand({
        gameRemoteId: parsedFormData.data.gameRemoteId,
        userRemoteId: userId,
        platform: parsedFormData.data.platform
    }));

    return null;
}

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    const gameStatusesLength = Object.keys(GameTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .length;

    const gameFormatsLength = Object.keys(GameTrackingFormat)
        .filter((s) => isNaN(Number(s)))
        .length;

    const gameOwnershipsLength = Object.keys(GameTrackingOwnership)
        .filter((s) => isNaN(Number(s)))
        .length;

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            gameRemoteId: z.preprocess(preProcessToNumber, z.number()),
            hoursPlayed: z.preprocess(preProcessToNumber, z.number().gte(0)),
            platform: z.string(),
            status: z.preprocess(preProcessToNumber, z.number().min(0).max(gameStatusesLength - 1)),
            format: z.preprocess(preProcessToNumber, z.number().min(0).max(gameFormatsLength - 1)),
            ownership: z.preprocess(preProcessToNumber, z.number().min(0).max(gameOwnershipsLength - 1))
        });

    return formDataSchema.safeParse(formData);
}

const handlePut = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    const parsedFormData = parseAndValidateFormData(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.game_UpdateGameTracking(new UpdateGameTrackingCommand({
        gameRemoteId: parsedFormData.data.gameRemoteId,
        userRemoteId: userId,
        hoursPlayed: parsedFormData.data.hoursPlayed,
        platform: parsedFormData.data.platform,
        ownership: parsedFormData.data.ownership,
        format: parsedFormData.data.format,
        status: parsedFormData.data.status,
    }));

    return null;
}

export const action: ActionFunction = async ({ request }) => {
    if (request.method === "DELETE") {
        return handleDelete(request);
    } else if (request.method === "PUT") {
        return handlePut(request);
    } else {
        return json({message: "Method not allowed"}, 405);
    }
}

interface GameTrackingStatusTableProps {
    status: string;
}

const GameTrackingStatusTable = ({status}: GameTrackingStatusTableProps) => {
    const theme = useMantineTheme();

    const isMobile = useMobileQuery();
    const modals = useModals();

    const [pageData, setPageData] = useState<GetAllGameTrackingsItemResult[]>([]);
    const [page, setPage] = useState(1);
    const [totalNoOfPages, setTotalNoOfPages] = useState(1);

    const fetcherTable = useFetcher<LoaderData>();
    const fetcherEditor = useFetcher();

    useEffect(() => {
        fetcherTable.submit({page: page.toString(), status: status}, { method: "get"});
    }, [page])

    useEffect(() => {
        if (fetcherEditor.type == "done") {
            fetcherTable.submit({page: page.toString(), status: status}, { method: "get"});
        }
    }, [fetcherEditor.type])

    useEffect(() => {
        if (fetcherTable.type == "done") {
            setPage(fetcherTable.data.page);
            setPageData(fetcherTable.data.items);
            setTotalNoOfPages(fetcherTable.data.totalNoOfPages);
        }
    }, [fetcherTable.type])

    return (
        <Stack py={16} sx={(theme) => ({
            overflowY: "scroll"
        })}>
            <Center sx={(theme) => ({
                height: "8px",
            })}>
                {fetcherTable.type === "loaderSubmission" && <Loader variant={"dots"}/> }
            </Center>
            
            <Table striped highlightOnHover verticalSpacing={"md"} fontSize={"md"} width={"100%"}>
                <thead>
                <tr>
                    <th></th>
                    <th>Title</th>
                    <th>Platform</th>
                    {!isMobile &&
                        (<>
                            <th>Hours Played</th>
                            <th>Format</th>
                            <th>Status</th>
                            <th>Ownership</th>
                        </>)}
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {pageData.map((gt) => (
                    <tr key={`${gt.gameRemoteId}${gt.platform}`}>
                        <td>
                            <CoverImage src={gt.coverImageURL} width={40} height={60}/>
                        </td>
                        <td>
                            <Link style={{color: theme.colors.dark[1], textDecoration: "none"}}
                                  to={`/home/games/${gt.gameRemoteId}`}>
                                <Text sx={(theme) => ({
                                    width: isMobile ? "10ch" : "20ch",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                })}>
                                    {gt.title}
                                </Text>
                            </Link>
                        </td>
                        <td>{gt.platform}</td>
                        {!isMobile && 
                            <>
                                <td>{gt.hoursPlayed}</td>
                                <td>{GameTrackingFormat[gt.format!!]}</td>
                                <td>{GameTrackingStatus[gt.status!!]}</td>
                                <td>{GameTrackingOwnership[gt.ownership!!]}</td>
                            </>}
                        <td>
                            <ActionIcon onClick={() => showTrackGameEditorModal(
                                            modals, 
                                            {
                                                title: gt.title,
                                                remoteId: gt.gameRemoteId,
                                                platforms: []
                                            }, 
                                            gt,
                                            [gt],
                                            () => {},
                                            (formData) => fetcherEditor.submit(formData, {method: "put"}),
                                            (formData) => fetcherEditor.submit(formData, {method: "delete"})
                            )}>
                                <Eye />
                            </ActionIcon>
                        </td>
                    </tr>))}
                </tbody>
            </Table>

            {(pageData.length == 0 && fetcherTable.type === "done") && 
                <Center p={32}>
                    <Text>You do not have {status.toLowerCase()} games.</Text>
                </Center>}

            {(totalNoOfPages != 0 && fetcherTable.type === "done") && 
                <Pagination size={"sm"} total={totalNoOfPages} onChange={setPage} page={page}/>}
        </Stack>
    );
}

export default function Games() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16}>
            <Title mb={32} order={1}>Games</Title>
            <Tabs grow variant={"outline"} styles={(theme) => ({
                tabControl: {
                    fontSize: theme.fontSizes.md
                }
            })}>
                <Tabs.Tab label={isMobile ? "" : "Playing"} icon={<PlayerPlay size={18}/>}>
                    <GameTrackingStatusTable status="Playing"/>
                </Tabs.Tab>
                <Tabs.Tab label={isMobile ? "" : "Paused"} icon={<PlayerPause size={18}/>}>
                    <GameTrackingStatusTable status="Paused"/>
                </Tabs.Tab>
                <Tabs.Tab label={isMobile ? "" : "Planning"} icon={<Clock size={18}/>}>
                    <GameTrackingStatusTable status="Planning"/>
                </Tabs.Tab>
                <Tabs.Tab label={isMobile ? "" : "Completed"} icon={<Check size={18}/>}>
                    <GameTrackingStatusTable status="Completed"/>
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}
