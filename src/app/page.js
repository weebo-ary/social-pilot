import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Landing from "@/frontend-landing/App";

export default async function HomePage() {
  return (
    <>
      <Landing />
    </>
  );
}
