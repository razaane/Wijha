"use client";

import MessagesClient from "@/app/messages/MessagesClient";

export default function Inbox() {
    return (
        <div className="w-full h-[calc(100vh-80px)]">
            <MessagesClient isHostMode={true} />
        </div>
    );
}
