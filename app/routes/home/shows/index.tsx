import {
    ActionIcon,
    Center,
    Container, Loader, LoadingOverlay, Pagination, Stack, Table, Tabs, Text,
    Title, useMantineTheme,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import {
    backendAPIClientInstance,
    ShowTrackingStatus,
    GetAllShowTrackingsItemResult,
    RemoveShowTrackingCommand,
    UpdateShowTrackingCommand, ShowType
} from "backend";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { useMobileQuery } from "~/utils/hooks";
import { useModals } from "@mantine/modals";
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import CoverImage from "~/components/home/CoverImage";
import { Check, Clock, Edit, Eye, PlayerPause } from "tabler-icons-react";
import { showTrackShowEditorModal } from "~/components/home/shows/TrackShowEditorModal";

interface LoaderData {
    items: GetAllShowTrackingsItemResult[],
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

    const getAllShowTrackingResponse = await backendAPIClientInstance.show_GetAllShowTrackings(
        userId,
        ShowTrackingStatus[parsedQueryData.data.status as keyof typeof ShowTrackingStatus],
        true,
        false,
        parsedQueryData.data.page,
        5
    );

    return json<LoaderData>({
        items: getAllShowTrackingResponse.result.items ?? [],
        page: getAllShowTrackingResponse.result.page ?? 0,
        totalNoOfPages: getAllShowTrackingResponse.result.totalPages ?? 0
    });
}

const handleDelete = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            showRemoteId: z.string(),
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.show_RemoveShowTracking(new RemoveShowTrackingCommand({
        showRemoteId: parsedFormData.data.showRemoteId,
        userRemoteId: userId
    }));

    return null;
}

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    const showStatusesLength = Object.keys(ShowTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .length;
    
    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            showRemoteId: z.string(),
            episodesWatched: z.preprocess(preProcessToNumber, z.number().gte(0)),
            status: z.preprocess(preProcessToNumber, z.number().min(0).max(showStatusesLength - 1)),
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

    await backendAPIClientInstance.show_UpdateShowTracking(new UpdateShowTrackingCommand({
        showRemoteId: parsedFormData.data.showRemoteId,
        userRemoteId: userId,
        episodesWatched: parsedFormData.data.episodesWatched,
        status: parsedFormData.data.status
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

interface ShowTrackingStatusTableProps {
    status: string;
    initialPage: number;
    onPageChange: (pageNo: number) => void;
}

const ShowTrackingStatusTable = ({ status, initialPage, onPageChange }: ShowTrackingStatusTableProps) => {
    const theme = useMantineTheme();
    const isMobile = useMobileQuery();
    const modals = useModals();

    const [pageData, setPageData] = useState<GetAllShowTrackingsItemResult[]>([]);
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
            <LoadingOverlay overlayOpacity={0.8} visible={
                fetcherTable.type === "init"
                || fetcherTable.type === "loaderSubmission"
                || fetcherEditor.state === "submitting"} />
            
            <Table striped highlightOnHover verticalSpacing={"md"} fontSize={"md"} width={"100%"}>
                <thead>
                <tr>
                    <th></th>
                    <th>Title</th>
                    <th>Episodes Watched</th>
                    {!isMobile &&
                        (<>
                            <th>Status</th>
                            <th>Show Type</th>
                        </>)}
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {pageData.map((st) => (
                    <tr key={`${st.showRemoteId}`}>
                        <td>
                            <CoverImage src={st.coverImageURL} width={40} height={60}/>
                        </td>
                        <td>
                            <Link style={{ color: theme.colors.dark[1], textDecoration: "none" }}
                                  to={`/home/shows/${st.showRemoteId}`}>
                                <Text sx={(theme) => ({
                                    width: isMobile ? "10ch" : "20ch",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                })}>
                                    {st.title}
                                </Text>
                            </Link>
                        </td>
                        <td>{st.episodesWatched}</td>
                        {!isMobile &&
                            <>
                                <td>{ShowTrackingStatus[st.status!!]}</td>
                                <td>{ShowType[st.showType!!]}</td>
                            </>}
                        <td>
                            <ActionIcon onClick={() => showTrackShowEditorModal(
                                modals,
                                {
                                    title: st.title,
                                    remoteId: st.showRemoteId,
                                },
                                st,
                                () => { },
                                (formData) => fetcherEditor.submit(formData, { method: "put" }),
                                (formData) => fetcherEditor.submit(formData, { method: "delete" })
                            )}>
                                <Edit/>
                            </ActionIcon>
                        </td>
                    </tr>))}
                </tbody>
            </Table>

            {(pageData.length == 0 && fetcherTable.type === "done") &&
                <Center p={32}>
                    <Text>You do not have {status.toLowerCase()} shows.</Text>
                </Center>}

            {(totalNoOfPages != 0 && fetcherTable.type === "done") &&
                <Pagination size={"sm"} total={totalNoOfPages} page={pageNo} onChange={(pageNo) => {
                    onPageChange(pageNo);
                    setPageNo(pageNo);
                }}/>}
        </Stack>
    );
}

export default function Shows() {
    const isMobile = useMobileQuery();
    let [searchParams, setSearchParams] = useSearchParams();
    let [tabIndex, setTabIndex] = useState(() => {
        const status = ShowTrackingStatus[searchParams.get("status") as keyof typeof ShowTrackingStatus];
        return status ?? ShowTrackingStatus.Completed;
    });
    let [page, setPage] = useState(() => {
        const page = parseInt(searchParams.get("page") ?? "1");
        return page < 0 ? 1 : page;
    });

    useEffect(() => {
        if (!searchParams.has("status")) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("status", ShowTrackingStatus[tabIndex]);
            newSearchParams.set("page", page.toString());
            setSearchParams(newSearchParams);
        }
    }, [searchParams])

    const onTabChange = (tabIndex: number) => {
        setTabIndex(tabIndex);
        setPage(1);

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("status", ShowTrackingStatus[tabIndex]);
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
        <Container py={16}>
            <Title mb={32} order={1}>Shows</Title>
            <Tabs grow
                  variant={"outline"}
                  active={tabIndex}
                  onTabChange={(tabIndex, _) => onTabChange(tabIndex)}
                  styles={(theme) => ({
                      tabControl: {
                          fontSize: theme.fontSizes.md
                      }
                  })}>
                <Tabs.Tab label={isMobile ? "" : "Completed"}
                          icon={<Check size={18}/>}>
                    <ShowTrackingStatusTable onPageChange={onPageChange}
                                             initialPage={page}
                                             status={ShowTrackingStatus[ShowTrackingStatus.Completed]}/>
                </Tabs.Tab>
                <Tabs.Tab label={isMobile ? "" : "Watching"}
                          icon={<Eye size={18}/>}>
                    <ShowTrackingStatusTable onPageChange={onPageChange}
                                             initialPage={page}
                                             status={ShowTrackingStatus[ShowTrackingStatus.Watching]}/>
                </Tabs.Tab>
                <Tabs.Tab label={isMobile ? "" : "Paused"}
                          icon={<PlayerPause size={18}/>}>
                    <ShowTrackingStatusTable onPageChange={onPageChange}
                                             initialPage={page}
                                             status={ShowTrackingStatus[ShowTrackingStatus.Paused]}/>
                </Tabs.Tab>
                <Tabs.Tab label={isMobile ? "" : "Planning"}
                          icon={<Clock size={18}/>}>
                    <ShowTrackingStatusTable onPageChange={onPageChange}
                                             initialPage={page}
                                             status={ShowTrackingStatus[ShowTrackingStatus.Planning]}/>
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}
