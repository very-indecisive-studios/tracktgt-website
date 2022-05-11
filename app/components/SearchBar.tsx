import { Chip, createStyles, TextInput } from "@mantine/core";
import { Form, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Search } from "tabler-icons-react";

const useStyles = createStyles((theme, _params, getRef) => ({
    iconWrapper: {
        display: "none"
    },
}));

interface SearchBarTypeProps {
    type: string;
}

function SearchBarType({ type }: SearchBarTypeProps) {
    const { classes } = useStyles();
    
    let color = "grey";
    if (type === "games") {
        color = "blue";    
    } else if (type === "shows") {
        color = "red";
    } else if (type === "books") {
        color = "yellow"
    }
    
    return (<Chip classNames={classes} variant={"filled"} color={color} checked={true}>in {type}</Chip>);
}

export default function SearchBar() {
    const location = useLocation();
    
    const [type, setType] = useState("");
    useEffect(() => {
        const path = location.pathname.slice(1).split("/");
        if (path.length > 1) {
            setType(path[1]);
        }
    },[location])
    
    return (                  
        <Form action={"/home/games/search"}>
            <TextInput 
                name="title" 
                placeholder={"Search"}  
                icon={<Search size={24} />}
                rightSection={<SearchBarType type={type} />}
                rightSectionWidth={100}/>
        </Form>
    );
}