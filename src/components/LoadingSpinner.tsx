import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    className?: string;
}

export const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
    return (
        <img
            src="/assets/spinner.PNG"
            alt="Loading..."
            className={cn("animate-spin object-contain", className)}
        />
    );
};
