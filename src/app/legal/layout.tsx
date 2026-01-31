import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function LegalLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 mt-20">
                <div className="mx-auto max-w-4xl">
                    <div className="glass-card bg-[var(--color-secondary)]/65 backdrop-blur-md border border-white/10 p-8 md:p-12 shadow-2xl">
                        {children}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
