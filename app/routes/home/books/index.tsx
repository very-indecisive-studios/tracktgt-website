import {
    ActionIcon,
    Center,
    Container, LoadingOverlay, MantineTheme, Pagination, Stack, Table, Tabs, Text,
    Title, useMantineTheme,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import {
    backendAPIClientInstance,
    BookTrackingFormat,
    BookTrackingOwnership,
    BookTrackingStatus,
    GetAllBookTrackingsItemResult, 
    RemoveBookTrackingCommand, 
    UpdateBookTrackingCommand
} from "backend";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { useMobileQuery } from "~/utils/hooks";
import { useModals } from "@mantine/modals";
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import CoverImage from "~/components/home/CoverImage";
import { Check, Clock, Edit, Eye, Eyeglass2, PlayerPause, Star } from "tabler-icons-react";
import { showTrackBookEditorModal } from "~/components/home/books/TrackBookEditorModal";
import { tabStyles } from "~/components/home/tabStyles";
import BookWishlistTable from "~/components/home/books/BookWishlistTable";

interface LoaderData {
    items: GetAllBookTrackingsItemResult[],
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

    const getAllBookTrackingResponse = await backendAPIClientInstance.book_GetAllBookTrackings(
        userId,
        BookTrackingStatus[parsedQueryData.data.status as keyof typeof BookTrackingStatus],
        true,
        false,
        false,
        false,
        parsedQueryData.data.page,
        5
    );

    return json<LoaderData>({
        items: getAllBookTrackingResponse.result.items ?? [],
        page: getAllBookTrackingResponse.result.page ?? 0,
        totalNoOfPages: getAllBookTrackingResponse.result.totalPages ?? 0
    });
}

const handleDelete = async (request: Request) => {
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())

    // Validate form.
    const formDataSchema = z
        .object({
            bookRemoteId: z.string(),
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.book_RemoveBookTracking(new RemoveBookTrackingCommand({
        bookRemoteId: parsedFormData.data.bookRemoteId,
        userRemoteId: userId
    }));

    return null;
}

const parseAndValidateFormData = (formData: { [p: string]: FormDataEntryValue }) => {
    const bookStatusesLength = Object.keys(BookTrackingStatus)
        .filter((s) => isNaN(Number(s)))
        .length;

    const bookFormatsLength = Object.keys(BookTrackingFormat)
        .filter((s) => isNaN(Number(s)))
        .length;

    const bookOwnershipsLength = Object.keys(BookTrackingOwnership)
        .filter((s) => isNaN(Number(s)))
        .length;

    // Validate form.
    const preProcessToNumber = (value: unknown) => (typeof value === "string" ? parseInt(value) : value);
    const formDataSchema = z
        .object({
            bookRemoteId: z.string(),
            chaptersRead: z.preprocess(preProcessToNumber, z.number().gte(0)),
            status: z.preprocess(preProcessToNumber, z.number().min(0).max(bookStatusesLength - 1)),
            format: z.preprocess(preProcessToNumber, z.number().min(0).max(bookFormatsLength - 1)),
            ownership: z.preprocess(preProcessToNumber, z.number().min(0).max(bookOwnershipsLength - 1))
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

    await backendAPIClientInstance.book_UpdateBookTracking(new UpdateBookTrackingCommand({
        bookRemoteId: parsedFormData.data.bookRemoteId,
        userRemoteId: userId,
        chaptersRead: parsedFormData.data.chaptersRead,
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

interface BookTrackingStatusTableProps {
    status: string;
    initialPage: number;
    onPageChange: (pageNo: number) => void;
}

const BookTrackingStatusTable = ({ status, initialPage, onPageChange }: BookTrackingStatusTableProps) => {
    const theme = useMantineTheme();
    const isMobile = useMobileQuery();
    const modals = useModals();

    const [pageData, setPageData] = useState<GetAllBookTrackingsItemResult[]>([]);
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
                    <th>Chapters Read</th>
                    {!isMobile &&
                        (<>
                            <th>Format</th>
                            <th>Status</th>
                            <th>Ownership</th>
                        </>)}
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {pageData.map((bt) => (
                    <tr key={`${bt.bookRemoteId}`}>
                        <td>
                            <CoverImage src={bt.coverImageURL} width={40} height={60}/>
                        </td>
                        <td>
                            <Link style={{ color: theme.colors.dark[1], textDecoration: "none" }}
                                  to={`/home/books/${bt.bookRemoteId}`}>
                                <Text sx={(theme) => ({
                                    width: isMobile ? "10ch" : "20ch",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                })}>
                                    {bt.title}
                                </Text>
                            </Link>
                        </td>
                        <td>{bt.chaptersRead}</td>
                        {!isMobile &&
                            <>
                                <td>{BookTrackingFormat[bt.format!!]}</td>
                                <td>{BookTrackingStatus[bt.status!!]}</td>
                                <td>{BookTrackingOwnership[bt.ownership!!]}</td>
                            </>}
                        <td>
                            <ActionIcon onClick={() => showTrackBookEditorModal(
                                modals,
                                {
                                    title: bt.title,
                                    remoteId: bt.bookRemoteId,
                                },
                                bt,
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
                    <Text>You do not have {status.toLowerCase()} books.</Text>
                </Center>}

            {(totalNoOfPages != 0 && fetcherTable.type === "done") &&
                <Pagination size={"sm"} total={totalNoOfPages} page={pageNo} onChange={(pageNo) => {
                    onPageChange(pageNo);
                    setPageNo(pageNo);
                }}/>}
        </Stack>
    );
}

function bookTabStyles(theme: MantineTheme) {
    return tabStyles(theme, theme.colors.yellow[8]);
}

function BooksTrackingTabs() {
    const isMobile = useMobileQuery();
    
    let [searchParams, setSearchParams] = useSearchParams();
    let [tabIndex, setTabIndex] = useState(() => {
        const status = BookTrackingStatus[searchParams.get("status") as keyof typeof BookTrackingStatus];
        return status ?? BookTrackingStatus.Completed;
    });
    let [page, setPage] = useState(() => {
        const page = parseInt(searchParams.get("page") ?? "1");
        return page < 0 ? 1 : page;
    });

    useEffect(() => {
        if (!searchParams.has("status")) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("status", BookTrackingStatus[tabIndex]);
            newSearchParams.set("page", page.toString());
            setSearchParams(newSearchParams);
        }
    }, [searchParams])

    const onTabChange = (tabIndex: number) => {
        setTabIndex(tabIndex);
        setPage(1);

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("status", BookTrackingStatus[tabIndex]);
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
              styles={bookTabStyles}>
            <Tabs.Tab label={isMobile ? "" : "Completed"}
                      icon={<Check size={18}/>}>
                <BookTrackingStatusTable onPageChange={onPageChange}
                                         initialPage={page}
                                         status={BookTrackingStatus[BookTrackingStatus.Completed]}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Reading"}
                      icon={<Eyeglass2 size={18}/>}>
                <BookTrackingStatusTable onPageChange={onPageChange}
                                         initialPage={page}
                                         status={BookTrackingStatus[BookTrackingStatus.Reading]}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Paused"}
                      icon={<PlayerPause size={18}/>}>
                <BookTrackingStatusTable onPageChange={onPageChange}
                                         initialPage={page}
                                         status={BookTrackingStatus[BookTrackingStatus.Paused]}/>
            </Tabs.Tab>
            <Tabs.Tab label={isMobile ? "" : "Planning"}
                      icon={<Clock size={18}/>}>
                <BookTrackingStatusTable onPageChange={onPageChange}
                                         initialPage={page}
                                         status={BookTrackingStatus[BookTrackingStatus.Planning]}/>
            </Tabs.Tab>
        </Tabs>
    );
}

export default function Books() {
    const isMobile = useMobileQuery();

      return (
        <Container py={16}>
            <Title mb={32} order={1}>Books</Title>

            <Tabs grow
                  variant={"unstyled"}
                  styles={bookTabStyles}>
                <Tabs.Tab label={isMobile ? "" : "Tracking"}
                          icon={<Eye size={18}/>}>
                    <BooksTrackingTabs />
                </Tabs.Tab>

                <Tabs.Tab label={isMobile ? "" : "Wishlist"}
                          icon={<Star size={18}/>}>
                    <BookWishlistTable />
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}
