import { ImageDisplayer } from "@/components/component/image-displayer";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  if (!user?.privateMetadata?.admin)
    return (
      <div className="flex justify-center items-center overflow-hidden">
        <div className="fixed top-4 right-4">
          <UserButton />
        </div>
        <h1 className="text-center text-2xl font-semibold tracking-tight ">
          Lo lamentamos, no tienes permiso para acceder a esta página. 😢
        </h1>
      </div>
    );

  return (
    <section className="overflow-hidden">
      <ImageDisplayer />¿
    </section>
  );
}
