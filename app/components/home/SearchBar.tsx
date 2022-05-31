import { Chip, TextInput } from "@mantine/core";
import { Form, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Search } from "tabler-icons-react";

interface SearchBarTypeProps {
    type: string;
}

function SearchBarType({ type }: SearchBarTypeProps) {
    let color = "grey";
    if (type === "games") {
        color = "blue";
    } else if (type === "shows") {
        color = "red";
    } else if (type === "books") {
        color = "yellow"
    }

    return (<Chip styles={(theme) => ({
        iconWrapper: {
            display: "none"
        },
    })} variant={"filled"} color={color} checked={true}>in {type}</Chip>);
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
            <TextInput
                name="title"
                placeholder={"Search"}
                icon={<Search size={20}/>}
                rightSection={<SearchBarType type={type}/>}
                rightSectionWidth={100}/>
        </Form>
    );
}