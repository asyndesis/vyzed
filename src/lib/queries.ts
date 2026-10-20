// Queries shared by several pages
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

// Me, with everything the app shell and profile editor need
export const Me = graphql(`
  query Me {
    me {
      id
      firstName
      lastName
      lastInitial
      email
      image
      bio
      priceAmount
      priceCurrency
      allowBarter
      skills {
        kind
        proficiency
        skillId
        skill {
          id
          name
          framework
        }
      }
    }
  }
`);

export const meQuery = gqlQuery(Me);
