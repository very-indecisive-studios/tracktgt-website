import { ActionIcon, Badge, Chip, Grid, Group, TextInput } from "@mantine/core";
import { Form, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Search } from "tabler-icons-react";

interface SearchBarTypeProps {
    type: string;
}

function SearchBarType({ type }: SearchBarTypeProps) {
    let color = "gray";
    if (type === "games") {
        color = "blue";
    } else if (type === "shows") {
        color = "red";
    } else if (type === "books") {
        color = "yellow";
    }

    return (                    
        <Badge size={"lg"}
               radius={0}
               color={color}
               sx={() => ({
                   width: "100%",
                   height: "100%"
               })}>
            in {type}
        </Badge>
    );
}

export default function SearchBar() {
    const location = useLocation();

    const [type, setType] = useState("");
    useEffect(() => {
        const path = location.pathname.slice(1).split("/");
        if (path.length > 1) {
            setType(path[1]);
        } else {
            setType("");
        }
    }, [location.pathname])

    return (
        <Form hidden={!type} action={`/home/${type}/search`}>
            <Grid columns={12} gutter={0}>
                <Grid.Col span={9}>
                    <TextInput
                        name="title"
                        placeholder={"Search"}
                        width={500}
                        radius={0} 
                        required />
                </Grid.Col>
                <Grid.Col span={2}>
                    <SearchBarType type={type} />
                </Grid.Col>
                <Grid.Col span={1}>
                    <ActionIcon size={"lg"} 
                                type={"submit"} 
                                variant={"filled"}
                                radius={0}
                                sx={() => ({
                                    width: "100%",
                                    height: "100%"
                                })}>
                        <Search size={20} />
                    </ActionIcon>
                </Grid.Col>
            </Grid>
        </Form>
    );
}