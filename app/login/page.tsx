import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md flex flex-col items-center">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter mb-2">The Framework</h1>
                    <p className="text-slate-500">Capture. Reflect. Learn.</p>
                </div>
                <AuthForm />
            </div>
        </div>
    );
}
