"use client";
import { BreadCrumbs } from "@/components/breadcrumbs";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";

const sequenceBatchQuery = gql`
  query sequenceBatch($id: ObjectID!) {
    sequenceBatch(id: $id) {
      id
      name
    }
  }
`;

export default function Page() {
  const { sequenceBatchId } = useParams();

  const { data, loading } = useQuery(sequenceBatchQuery, {
    variables: {
      id: sequenceBatchId,
    },
  });

  return (
    <BreadCrumbs
      isLoading={loading}
      overrides={{
        "sequence-batch": { href: "/dashboard" },
        [sequenceBatchId]: { label: data?.sequenceBatch?.name || "Error" },
      }}
    />
  );
}
