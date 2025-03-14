"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🚫 Oops! 👀 Nope, this is&apos;t for your eyes </h1>
      <p>Error 403</p>
      <button onClick={() => router.push("/")}>Go to Dashboard</button>
    </div>
  );
}
