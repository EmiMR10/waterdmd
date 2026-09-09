import { notFound } from "next/navigation";
import { getProperty } from "@/lib/db";
import { PropertyDetailClient } from "@/components/PropertyDetailClient";

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();
  return <PropertyDetailClient property={property} />;
}
