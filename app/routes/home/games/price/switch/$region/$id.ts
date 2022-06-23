import {
    backendAPIClientInstance,
    GetSwitchGamePriceResult
} from "backend";
import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

//region Server

interface LoaderData {
    gamePrice: GetSwitchGamePriceResult | null
}

export const loader: LoaderFunction = async ({ params, request }) => {
    await requireUserId(request);
    
    const gameId: number = parseInt(params.id ?? "0");
    const region: string = params.region ?? "";

    const backendAPIResponse = await backendAPIClientInstance.price_GetSwitchGamePrice(region, gameId);

    return json<LoaderData>({
        gamePrice: backendAPIResponse.result
    });
}

//endregion

//region Client

interface SwitchGamePriceStateAndFunc {
    price: GetSwitchGamePriceResult | null;
    isLoading: boolean;
}

export function useSwitchGamePrice(region: string, gameRemoteId: number): SwitchGamePriceStateAndFunc {
    const fetcherWishlistLoader = useFetcher<LoaderData>();

    const [price, setPrice] = useState<GetSwitchGamePriceResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetcherWishlistLoader.submit(
            null, 
            { 
                action: `/home/games/price/switch/${region}/${gameRemoteId}`, 
                method: "get" 
            }
        );
        setIsLoading(true);
    }, []);

    useEffect(() => {
        if (fetcherWishlistLoader.type === "done") {
            setPrice(fetcherWishlistLoader.data.gamePrice);
            setIsLoading(false);
        }
    }, [fetcherWishlistLoader.type]);
    
    return {
        price,
        isLoading
    }
}

//endregion
