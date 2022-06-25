import { Image } from "@mantine/core";

interface PlatformIconProps {
    platform: string;
}

export default function PlatformIcon({ platform }: PlatformIconProps) {
    let icon: string | undefined = undefined;
    switch (platform) {
        case "Switch": 
            icon = "/platform/switch.svg";
            break;
        case "Wii": 
            icon = "/platform/wii.svg";
            break;
        case "XONE":
        case "Series X":
        case "X360":
            icon = "/platform/xbox.svg";
            break;
        case "PC":
            icon = "/platform/pc.svg";
            break;
        case "Linux":
            icon = "/platform/linux.svg";
            break;
        case "Mac":
        case "iOS":
            icon = "/platform/apple.svg";
            break;
        case "Android":
            icon = "/platform/android.svg";
            break;
        case "Vita":
        case "PSP":
        case "PS2":
        case "PS3":
        case "PS4":
        case "PS5":
            icon = "/platform/ps.svg";
            break;
    }
    
    return (!icon ? null :
        <Image fit="contain" src={icon} width={16} height={16} />
    );
}