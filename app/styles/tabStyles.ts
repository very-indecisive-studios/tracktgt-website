import { MantineTheme } from "@mantine/core";

const tabControl = (theme: MantineTheme) => ({
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
})

export function trackingMediaTabStyles(theme: MantineTheme) {
    return ({
        tabControl: tabControl(theme),
        tabActive: {
            '&:nth-of-type(1)': {
                backgroundColor: theme.colors.blue[8],
                borderColor: theme.colors.blue[8],
            },
            '&:nth-of-type(2)': {
                backgroundColor: theme.colors.red[8],
                borderColor: theme.colors.red[8],
            },
            '&:nth-of-type(3)': {
                backgroundColor: theme.colors.yellow[8],
                borderColor: theme.colors.yellow[8],
            },
            color: theme.white,
        },
    });
}

export function wishlistMediaTabStyles(theme: MantineTheme) {
    return ({
        tabControl: tabControl(theme),
        tabActive: {
            '&:nth-of-type(1)': {
                backgroundColor: theme.colors.blue[8],
                borderColor: theme.colors.blue[8],
            },
            '&:nth-of-type(2)': {
                backgroundColor: theme.colors.yellow[8],
                borderColor: theme.colors.yellow[8],
            },
            color: theme.white,
        },
    });
}

export function mediaTabStyles(theme: MantineTheme, mediaColor: string) {
    return ({
        tabControl: tabControl(theme),
        tabActive: {
            backgroundColor: mediaColor,
            borderColor: mediaColor,
            color: theme.white,
        },
    });
}