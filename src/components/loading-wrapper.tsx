import { Loader2 } from 'lucide-react';

interface LoadingWrapperProps {
    isLoading: boolean;
    children: React.ReactNode;
    loadingText?: string;
    className?: string;
}

export function LoadingWrapper({
    isLoading,
    children,
    loadingText = 'Loading...',
    className = '',
}: LoadingWrapperProps) {
    if (isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">{loadingText}</p>
            </div>
        );
    }

    return <>{children}</>;
}

export function withLoading<T extends JSX.IntrinsicAttributes>(
    Component: React.ComponentType<T>,
    options: { loadingText?: string; className?: string } = {}
) {
    return function WithLoading(props: T & { isLoading?: boolean }) {
        const { isLoading, ...rest } = props;
        return (
            <LoadingWrapper
                isLoading={!!isLoading}
                loadingText={options.loadingText}
                className={options.className}
            >
                <Component {...(rest as T)} />
            </LoadingWrapper>
        );
    };
}
