import crystalBall from "@/assets/crystal-ball.png";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message = "Consulting the crystal..." }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative">
        <img 
          src={crystalBall} 
          alt="Loading" 
          className="w-32 h-32 animate-crystal-spin animate-crystal-glow"
        />
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent blur-xl"></div>
      </div>
      {message && (
        <p className="text-lg font-gothic text-foreground/80 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
