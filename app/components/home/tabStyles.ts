import { MantineTheme } from "@mantine/core";

export function tabStyles(theme: MantineTheme, color: string) {
    return ({
        tabControl: {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[9],
            border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[4]}`,
            fontSize: theme.fontSizes.sm,
            padding: `${theme.spacing.sm}px ${theme.spacing.sm}px`,
    
            '&:not(:first-of-type)': {
                borderLeft: 0,
            },
    
            '&:first-of-type': {
                borderTopLeftRadius: theme.radius.sm,
                borderBottomLeftRadius: theme.radius.sm,
            },
    
            '&:last-of-type': {
                borderTopRightRadius: theme.radius.sm,
                borderBottomRightRadius: theme.radius.sm,
            },
        },
    
        tabActive: {
            backgroundColor: color,
            borderColor: color,
            color: theme.white,
        },
    });
}