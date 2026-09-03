import { getBuildId } from "@/lib/build-info";

export default function Home() {
  const buildId = getBuildId();

  return (
    <main>
      <h1>MyGame</h1>
      <p data-testid="build-id">
        Build: <code>{buildId}</code>
      </p>
    </main>
  );
}
