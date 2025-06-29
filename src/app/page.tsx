import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { VouchlyLogo } from "@/components/icons";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block">
            <VouchlyLogo className="h-12 w-auto text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary mt-4">Vouchly</h1>
          <p className="mt-2 text-lg text-foreground/80 font-body">
            Find Reliable Partners for Accountable Co-Studying.
          </p>
          <p className="mt-1 text-sm text-primary/80 font-semibold">
            Free for all UK University Students!
          </p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="font-headline">Login</TabsTrigger>
            <TabsTrigger value="signup" className="font-headline">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
