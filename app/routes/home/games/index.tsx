import {
    ActionIcon,
    Center,
    Container,
    LoadingOverlay,
    MantineTheme,
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
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import CoverImage from "~/components/home/CoverImage";
import { Check, Clock, Edit, Eye, PlayerPause, PlayerPlay, Star } from "tabler-icons-react";
import React, { useEffect, useState } from "react";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { useMobileQuery } from "~/utils/hooks";
import { useModals } from "@mantine/modals";
import { showTrackGameEditorModal } from "~/components/home/games/TrackGameEditorModal";
import GameWishlistTable from "~/components/home/games/GameWishlistTable";
import tabStyles from "~/styles/tabStyles";

interface LoaderData {
    items: GetAllGameTrackingsItemResult[],
    page: number,
    totalNoOfPages: number
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);

    let url = new URL(request.url);
    let queryData = {
        search: url.searchParams.get("search"),
        page: url.searchParams.get("page"),
        status: url.searchParams.get("status")
    }

    // This is just the page loading not the table requesting.
    // Return empty response.
    if (!queryData.search) {
        return null;
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
        return json({ message: "Method not allowed" }, 405);
    }
}

interface GameTrackingStatusTableProps {
    status: string;
    initialPage: number;
    onPageChange: (pageNo: number) => void;
}

const GameTrackingStatusTable = ({ status, initialPage, onPageChange }: GameTrackingStatusTableProps) => {
    const theme = useMantineTheme();
    const isMobile = useMobileQuery();
    const modals = useModals();

    const [pageData, setPageData] = useState<GetAllGameTrackingsItemResult[]>([]);
    const [pageNo, setPageNo] = useState(initialPage);
    const [totalNoOfPages, setTotalNoOfPages] = useState(1);

    const fetcherTable = useFetcher<LoaderData>();
    const fetcherEditor = useFetcher();

    useEffect(() => {
        fetcherTable.submit({ search: "true", page: pageNo.toString(), status: status }, { method: "get" });
    }, [pageNo])

    useEffect(() => {
        if (fetcherEditor.type == "done") {
            fetcherTable.submit({ search: "true", page: pageNo.toString(), status: status }, { method: "get" });
        }
    }, [fetcherEditor.type])

    useEffect(() => {
        if (fetcherTable.type == "done") {
            setPageData(fetcherTable.data.items);
            setTotalNoOfPages(fetcherTable.data.totalNoOfPages);
            
            if (pageNo > fetcherTable.data.totalNoOfPages) {
                if (fetcherTable.data.totalNoOfPages > 0) {
                    setPageNo(fetcherTable.data.totalNoOfPages);
                    onPageChange(fetcherTable.data.totalNoOfPages);
                } else {
                    setPageNo(1);
                    onPageChange(1);
                }
            }
        }
    }, [fetcherTable.type])

    return (
        <Stack py={16} sx={(theme) => ({
            overflowX: "auto",
            position: "relative",
            height: "600px"
        })}>
            <LoadingOverlay overlayOpacity={1} overlayColor={theme.colors.dark[8]} visible={
                fetcherTable.type === "init"
                || fetcherTable.type === "loaderSubmission"
                || fetcherEditor.state === "submitting"} />

            {(pageData.length == 0 && fetcherTable.type === "done") ?
                <Center p={32}>
                    <Text align={"center"}>You do not have {status.toLowerCase()} games.</Text>
                </Center> :
                <>
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
                                    <Link style={{ color: theme.colors.dark[1], textDecoration: "none" }}
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
                                        () => {
                                        },
                                        (formData) => fetcherEditor.submit(formData, { method: "put" }),
                                        (formData) => fetcherEditor.submit(formData, { method: "delete" })
                                    )}>
                                        <Edit/>
                                    </ActionIcon>
                                </td>
                            </tr>))}
                        </tbody>
                    </Table>

                    {(totalNoOfPages != 0 && fetcherTable.type === "done") &&
                        <Pagination size={"sm"} total={totalNoOfPages} page={pageNo} onChange={(pageNo) => {
                            onPageChange(pageNo);
                            setPageNo(pageNo);
                        }}/>}
                </>
            }
        </Stack>
    );
}

function gameTabStyles(theme: MantineTheme) {
    return tabStyles(theme, theme.colors.blue[8]);
}

function GameTrackingTabs() {
    const isMobile = useMobileQuery();
    
    let [searchParams, setSearchParams] = useSearchParams();
    let [tabIndex, setTabIndex] = useState(() => {
        const status = GameTrackingStatus[searchParams.get("status") as keyof typeof GameTrackingStatus];
        return status ?? GameTrackingStatus.Completed;
    });
    let [page, setPage] = useState(() => {
        const page = parseInt(searchParams.get("page") ?? "1");
        return page < 0 ? 1 : page;
    });

    useEffect(() => {
        if (!searchParams.has("status")) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("status", GameTrackingStatus[tabIndex]);
            newSearchParams.set("page", page.toString());
            setSearchParams(newSearchParams);
        }
    }, [searchParams])

    const onTabChange = (tabIndex: number) => {
        setTabIndex(tabIndex);
        setPage(1);

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("status", GameTrackingStatus[tabIndex]);
        newSearchParams.set("page", "1");
        setSearchParams(newSearchParams);
    }

    const onPageChange = (pageNo: number) => {
        setPage(pageNo);

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", pageNo.toString());
        setSearchParams(newSearchParams);
    }
    
    return (
        <Tabs grow
              variant={"unstyled"}
              active={tabIndex}
              onTabChange={(tabIndex, _) => onTabChange(tabIndex)}
              styles={gameTabStyles}>
            <Tabs.Tab label={isMobile ? "" : "Completed"}
                      icon={<Check size={18}/>}>
                <GameTrackingStatusTable onPageChange={onPageChange}
                                         initialPage={page}
                                         status={GameTrackingStatus[GameTrackingStatus.Completed]}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Playing"}
                      icon={<PlayerPlay size={18}/>}>
                <GameTrackingStatusTable onPageChange={onPageChange}
                                         initialPage={page}
                                         status={GameTrackingStatus[GameTrackingStatus.Playing]}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Paused"}
                      icon={<PlayerPause size={18}/>}>
                <GameTrackingStatusTable onPageChange={onPageChange}
                                         initialPage={page}
                                         status={GameTrackingStatus[GameTrackingStatus.Paused]}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Planning"}
                      icon={<Clock size={18}/>}>
                <GameTrackingStatusTable onPageChange={onPageChange}
                                         initialPage={page}
                                         status={GameTrackingStatus[GameTrackingStatus.Planning]}/>
            </Tabs.Tab>
        </Tabs>
    );
}

export default function Games() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Games</Title>
            
            <Tabs grow
                  variant={"unstyled"}
                  styles={gameTabStyles}>
                <Tabs.Tab label={isMobile ? "" : "Tracking"}
                          icon={<Eye size={18}/>}>
                    <GameTrackingTabs />
                </Tabs.Tab>

                <Tabs.Tab label={isMobile ? "" : "Wishlist"}
                          icon={<Star size={18}/>}>
                    <GameWishlistTable />
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}
