import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/Toast";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
    title: "TrackIt - Simple Time Tracking",
    description: "A simple and beautiful time tracking tool to monitor your daily tasks and productivity",
    keywords: ["time tracking", "productivity", "task management", "time tracker"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                {children}
                <ToastContainer />
            </body>
        </html>
    );
}
