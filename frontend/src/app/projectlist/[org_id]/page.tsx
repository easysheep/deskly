import React from "react";
import ProjectsList from "@/components/ProjectsList";

interface PageProps {
  params: Promise<{ org_id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { org_id } = await params;
  return <ProjectsList org_id={org_id} />;
}