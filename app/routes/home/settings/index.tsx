import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { getUserId, requireUserId } from "~/utils/session.server";
import { useMobileQuery } from "~/utils/hooks";
import { Button, Container, Group, Image, InputWrapper, Stack, Textarea, TextInput, Title } from "@mantine/core";
import React, { useRef, useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { showNotification } from "@mantine/notifications";
import { Check, FileAlert, FileUpload, Refresh } from "tabler-icons-react";
import { badRequest } from "~/utils/response.server";
import { z } from "zod";
import { backendAPIClientInstance, minioClientInstance, UpdateBioCommand, UpdateProfilePicCommand } from "backend";

//region Server

interface LoaderData {
    userName: string;
    email: string;
    profilePictureURL: string;
    bio: string;
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);

    const getUserResponse = await backendAPIClientInstance.user_GetUser(userId); 
    const { userName, email, profilePictureURL, bio } = getUserResponse.result;

    return json<LoaderData>({
        userName,
        email,
        profilePictureURL,
        bio
    });
}

const handlePost = async (request: Request) => {
    const userId = await requireUserId(request);

    const formData = await request.formData();

    // Process profile picture
    let profilePicture = formData.get("profilePicture");
    if (profilePicture) {
        profilePicture = profilePicture as File;
        
        if (profilePicture.type != "image/jpeg" ) {
            throw badRequest(null);
        }

        const response = await minioClientInstance.putObject(
            "profilepictures",
            `${userId}.jpg`,
            Buffer.from(await profilePicture.arrayBuffer())
        );
        
        if (!response.etag) {
            throw badRequest(null);
        }

        await backendAPIClientInstance.user_UpdateProfilePic(new UpdateProfilePicCommand({
            userRemoteId: userId,
            profilePictureURL: `https://${process.env.STORAGE_URL}/profilepictures/${userId}.jpg`
        }));
    }

    return null;
}

const handlePut = async (request: Request) => {
    const userId = await requireUserId(request);

    // Process profile info
    const formData = Object.fromEntries(await request.formData());
    
    const formDataSchema = z
        .object({
            bio: z.string().max(256)
        });

    const parsedFormData = formDataSchema.safeParse(formData);
    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.user_UpdateBio(new UpdateBioCommand({
        userRemoteId: userId,
        bio: parsedFormData.data.bio
    }));

    return null;
}

export const action: ActionFunction = async ({ request }) => {
    if (request.method === "POST") {
        return await handlePost(request);
    } else if (request.method === "PUT") {
        return await handlePut(request);
    } else {
        return json({ message: "Method not allowed" }, 405);
    }
}

//endregion

//region Client

export default function SettingsPricing() {
    const loaderData = useLoaderData<LoaderData>();
    const isMobile = useMobileQuery();
    
    const [imageURL, setImageURL] = useState(loaderData.profilePictureURL ?? "/default_user.svg");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileButtonSumbitRef = useRef<HTMLButtonElement>(null);

    return (
        <Container px={isMobile ? 4 : 16}>
            <Title mt={isMobile ? 16 : 0} mb={16} order={2} sx={(theme) => ({
                color: theme.colors.gray[5]
            })}>
                Account
            </Title>

            <Form 
                replace
                encType="multipart/form-data" 
                method="post" 
                onSubmit={()=> {
                    showNotification({
                        title: 'Successfully saved your settings.',
                        message: `Changes may take a while to be reflected. Refresh the page to view changes made.`,
                        icon: <Check size={16}/>,
                        color: "green"
                    });
                }}>
                <Title my={8} order={3} sx={(theme) => ({
                    color: theme.colors.gray[6]
                })}>
                    Profile picture
                </Title>
                <Group my={32}>
                    <Stack>
                        <Image radius={isMobile ? 100 : 150} height={isMobile ? 100 : 150} width={isMobile ? 100 : 150} src={imageURL} />

                        <Group>
                            <Button variant="outline" leftIcon={<FileUpload size={20} />} onClick={() => {
                                fileInputRef.current?.click();
                            }}>
                                Upload picture
                            </Button>

                            <button
                                ref={fileButtonSumbitRef}
                                hidden
                                type="submit">
                            </button>
                        </Group>
                    </Stack>

                    <input ref={fileInputRef} hidden type="file" name="profilePicture" accept="image/jpeg" onChange={(e) => {
                        const fileList = e.target.files;
                        if (fileList && fileList.length > 0) {
                            const file = fileList[0];
                            if (file.size > 2_097_152) {
                                showNotification({
                                    title: 'File size too big.',
                                    message: `Please upload files less than 2MB in size.`,
                                    icon: <FileAlert size={16}/>,
                                    color: "red"
                                });

                                return;
                            }
                            
                            setImageURL(URL.createObjectURL(fileList[0]));

                            fileButtonSumbitRef.current?.click();
                        }
                    }} />
                </Group>
            </Form>
            
            <Form 
                replace 
                method="put" 
                onSubmit={()=> {
                    showNotification({
                        title: 'Successfully saved your settings.',
                        message: `Changes may take a while to be reflected. Refresh the page to view changes made.`,
                        icon: <Check size={16}/>,
                        color: "green"
                    });
                }}>
                <Title my={8} order={3} sx={(theme) => ({
                        color: theme.colors.gray[6]
                })}>
                    Username
                </Title>
                <TextInput mb={32} disabled value={loaderData.userName} />

                <Title my={8} order={3} sx={(theme) => ({
                        color: theme.colors.gray[6]
                })}>
                    Email
                </Title>
                <TextInput mb={32} disabled value={loaderData.email} />

                <Title my={8} order={3} sx={(theme) => ({
                    color: theme.colors.gray[6]
                })}>
                    Bio
                </Title>
                <Textarea
                    mb={32}
                    maxLength={256} 
                    autosize 
                    defaultValue={loaderData.bio}
                    placeholder="Tell others about yourself" 
                    minRows={3} 
                    name="bio" />

                <Group position={"right"}>
                    <Button type="submit">
                        Save Changes
                    </Button>
                </Group>
            </Form>
        </Container>
    );
}

//endregion