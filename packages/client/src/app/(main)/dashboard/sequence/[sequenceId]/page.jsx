"use client";
import React from "react";
import { SequenceHeaderCard } from "./components/sequence-header-card";
import { SequenceBody } from "./components/sequence-body";
import { gql, useQuery } from "@apollo/client";
import { SequenceModalEdit } from "./components/sequence-modal-edit";
import { useParams } from "next/navigation";
import { WithLoading } from "@/components/with-loading";

const sequenceQuery = gql`
  query sequence($id: ObjectID!) {
    sequence(id: $id) {
      id
      name
      createdAt
    }
  }
`;

export default function Page() {
  const { sequenceId } = useParams();

  const { data, loading, error } = useQuery(sequenceQuery, {
    variables: {
      id: sequenceId,
    },
  });

  return (
    <WithLoading isLoading={loading} error={error}>
      <div className="flex flex-col gap-4">
        <SequenceHeaderCard sequence={data?.sequence} />
        <SequenceBody />
        <SequenceModalEdit sequence={data?.sequence} />
      </div>
    </WithLoading>
  );
}
