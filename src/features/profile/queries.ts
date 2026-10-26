import { gqlQuery, graphql } from "@/lib/gql";

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
