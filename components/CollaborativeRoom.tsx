"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react";
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs';

import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import ActiveCollaborators from "@/components/ActiveCollaborators";
import { Input } from "@/components/ui/input";
import { updateDocument } from "@/lib/actions/room.actions";

export default function CollaborativeRoom({ roomId, roomMetadata }: CollaborativeRoomProps) {
    const currentUserType = "editor";

    const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setLoading(true);

            try {
                if (documentTitle !== roomMetadata.title) {
                    const updatedDocument = await updateDocument(roomId, documentTitle);
                    
                    if (updatedDocument) {
                        setEditing(false);
                    }
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setEditing(false);
                updateDocument(roomId, documentTitle);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [roomId, documentTitle])

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing])

    return (
        <RoomProvider id={roomId}>
            <ClientSideSuspense fallback={<div>Loading…</div>}>
                <div className="collaborative-room">
                    <Header>
                        <div ref={containerRef} className="flex w-fit items-center justify-center gap-2">
                            {editing && !loading ? (
                                <Input
                                    type="text"
                                    value={documentTitle}
                                    ref={inputRef}
                                    placeholder="Enter title"
                                    onChange={(e) => setDocumentTitle(e.target.value)}
                                    onKeyDown={updateTitleHandler}
                                    disabled={!editing}
                                    className="document-title-input"
                                />
                            ): (
                                <>
                                    <p className="document-title">{documentTitle}</p>
                                </>
                            )}

                            {currentUserType === "editor" && !editing && (
                                <Image 
                                    src="/assets/icons/edit.svg"
                                    alt="Edit"
                                    width={24}
                                    height={24}
                                    onClick={() => setEditing(true)}
                                    className="cursor-pointer"
                                />
                            )}

                            {currentUserType !== "editor" && !editing && (
                                <p className="view-only-tag">View only</p>
                            )}

                            {loading && <p className="text-sm text-gray-400">saving...</p>}
                        </div>
                        <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
                            <ActiveCollaborators />
                            <SignedOut>
                                <SignInButton />
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>
                    </Header>
                    <Editor />
                </div>
            </ClientSideSuspense>
        </RoomProvider>
    );
}