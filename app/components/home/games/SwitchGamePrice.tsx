import { useSwitchGamePrice } from "~/routes/home/games/price/switch/$id";
import { Group, Loader, Text } from "@mantine/core";
import { Minus, TrendingDown } from "tabler-icons-react";
import React from "react";

interface SwitchGamePriceProps {
    gameRemoteId: number;
}

export default function SwitchGamePrice({ gameRemoteId }: SwitchGamePriceProps) {
    const { price, isLoading } = useSwitchGamePrice(gameRemoteId);

    return (
        <>
            {isLoading ?
                <Loader size="xs" variant="bars" /> :
                (!price) ?
                    <Text>N/A</Text>:
                    <Group spacing={"xs"}>
                        { price.isOnSale ? <TrendingDown color={"green"} size={22} /> : <Minus size={22} />}
                        
                        <Text variant={"link"} component={"a"} href={price.url} sx={(theme) => ({
                            color: price.isOnSale ? theme.colors.green[4] : theme.colors.dark[1],
                            textDecoration: "none"
                        })}>
                            {price.currency} {price.price?.toFixed(2)}
                        </Text>
                    </Group>
            }
        </>
    )
}
