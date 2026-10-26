import { gqlQuery, graphql } from "@/lib/gql";

// Categories (Language, Programming, …) with their skills. Changes rarely.
export const SkillTree = graphql(`
  query SkillTree {
    skills {
      id
      slug
      name
      children {
        id
        name
        framework
      }
    }
  }
`);

export const skillTreeQuery = { ...gqlQuery(SkillTree), staleTime: Infinity };
