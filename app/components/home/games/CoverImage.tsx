import { Image, Skeleton } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

interface CoverImageProps {
    src: string | undefined;
    width: number;
    height: number;
}

export default function CoverImage({ src, width, height }: CoverImageProps) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        setIsImageLoaded(true);
    }, [imageRef.current?.complete])
    
    return (
      <>
          <Image imageRef={imageRef} onLoad={() => setIsImageLoaded(true)} 
                 src={src}
                 hidden={!isImageLoaded}
                 width={width}
                 height={height}
                 radius={"md"} 
                 withPlaceholder={!src}/>
          { !isImageLoaded && <Skeleton width={width} height={height} radius={"md"}/> }
      </>  
    );
}