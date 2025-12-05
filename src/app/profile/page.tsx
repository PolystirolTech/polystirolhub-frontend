import { Header } from '@/components/layout/header';

export default function ProfilePage() {
    return (
        <div className="min-h-screen pb-20 pt-24">
            <Header />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="glass-card bg-white/5 flex min-h-[60vh] flex-col items-center justify-center p-10 text-center">
                    <h1 className="mb-4 text-4xl font-bold tracking-tighter text-white sm:text-6xl">
                        Profile Page
                    </h1>
                    <p className="max-w-2xl text-lg text-muted">
                        This page is under construction.
                    </p>
                </div>
            </main>
        </div>
    );
}
