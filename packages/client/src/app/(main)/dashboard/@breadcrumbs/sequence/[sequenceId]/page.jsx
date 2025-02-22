"use client";
import { BreadCrumbs } from "@/components/breadcrumbs";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";

const sequenceQuery = gql`
  query sequence($id: ObjectID!) {
    sequence(id: $id) {
      id
      name
    }
  }
`;

export default function Page() {
  const { sequenceId } = useParams();

  const { data, loading } = useQuery(sequenceQuery, {
    variables: {
      id: sequenceId,
    },
  });

  return (
    <BreadCrumbs
      isLoading={loading}
      overrides={{
        sequence: { href: "/dashboard" },
        [sequenceId]: { label: data?.sequence?.name || "Error" },
      }}
    />
  );
}
