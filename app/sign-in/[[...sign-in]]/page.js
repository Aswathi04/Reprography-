import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = auth();
  if (userId) {
    redirect("/order");
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/order"
        fallbackRedirectUrl="/order"
      />
    </div>
  );
}