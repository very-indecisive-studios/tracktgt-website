import {
    Center,
    Container,
    Group,
    Loader, LoadingOverlay,
    Pagination, Skeleton,
    Stack,
    Table,
    Tabs,
    Text,
    Title,
    Tooltip,
    useMantineTheme
} from "@mantine/core";
import {
    GameTrackingFormat,
    GameTrackingOwnership,
    GameTrackingStatus,
    GetAllGameTrackingsItemResult,
} from "backend";
import { Link, useFetcher } from "@remix-run/react";
import CoverImage from "~/components/CoverImage";
import { Check, Clock, MoodConfuzed, PlayerPause, PlayerPlay } from "tabler-icons-react";
import { useEffect, useState } from "react";
import { GameTrackingLoaderData } from "~/routes/home/games/track";

interface GameTrackingStatusTableProps {
    status: string;
}

const GameTrackingStatusTable = ({ status }: GameTrackingStatusTableProps) => {
    const theme = useMantineTheme();
    
    const [pageData, setPageData] = useState<GetAllGameTrackingsItemResult[]>([]);
    const [page, setPage] = useState(1);
    const [totalNoOfPages, setTotalNoOfPages] = useState(1);
    
    const fetcher = useFetcher<GameTrackingLoaderData>();
    
    useEffect(() => {
        fetcher.submit({ page: page.toString(), status: status }, { action: "/home/games/track", method: "get" });
    }, [page])
    
    useEffect(() => {
        if (fetcher.type == "done") {
            setPageData(fetcher.data.items);
            setTotalNoOfPages(fetcher.data.totalNoOfPages);
        }
    }, [fetcher.type])
        
    return (
        <Stack py={16} sx={(theme) => ({
            overflowY: "scroll"
        })}>
            <Table striped highlightOnHover verticalSpacing={"md"} fontSize={"md"} width={"100%"}>
                <thead>
                    <tr>
                        <th></th>
                        <th>Title</th>
                        <th>Platform</th>
                        <th>Hours Played</th>
                        <th>Format</th>
                        <th>Status</th>
                        <th>Ownership</th>
                    </tr>
                </thead>
                <tbody>
                    {pageData.map((gt) => (
                        <tr key={gt.gameRemoteId}>
                            <td>
                                <CoverImage src={gt.coverImageURL} width={40} height={60}/>
                            </td>
                            <td>
                                <Link style={{color: theme.colors.dark[1], textDecoration: "none"}} to={`/home/games/${gt.gameRemoteId}`}>
                                    <Text sx={(theme) => ({
                                        width: "20ch",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    })}>
                                        {gt.title}
                                    </Text>
                                </Link>
                            </td>
                            <td>{gt.platform}</td>
                            <td>{gt.hoursPlayed}</td>
                            <td>{GameTrackingFormat[gt.format!!]}</td>
                            <td>{GameTrackingStatus[gt.status!!]}</td>
                            <td>{GameTrackingOwnership[gt.ownership!!]}</td>
                        </tr>))}
                </tbody>
            </Table>
                
            <Center sx={(theme) => ({
                height: "16px"
            })} >
                {fetcher.type === "loaderSubmission" && <Loader variant={"dots"}/>}
            </Center>
            
            <Pagination size={"sm"} total={totalNoOfPages} onChange={setPage} page={page} />
        </Stack>
    );
}

export default function Games() {
    return (
        <Container py={16}>
            <Title mb={32} order={1}>Games</Title>
            <Tabs grow variant={"outline"} styles={(theme) => ({
                tabControl: {
                    fontSize: theme.fontSizes.md
                }
            })}>
                <Tabs.Tab label="Playing" icon={<PlayerPlay size={18} />}>
                    <GameTrackingStatusTable status="Playing"/>
                </Tabs.Tab>
                <Tabs.Tab label="Paused" icon={<PlayerPause size={18} />}>
                    <GameTrackingStatusTable status="Paused" />
                </Tabs.Tab>
                <Tabs.Tab label="Planning" icon={<Clock size={18} />}>
                    <GameTrackingStatusTable status="Planning"/>
                </Tabs.Tab>                
                <Tabs.Tab label="Completed" icon={<Check size={18} />}>
                    <GameTrackingStatusTable status="Completed"/>
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}