import { builder } from "@/server/graphql/builder";
import "./types/enums";
import "./types/skill";
import "./types/user";
import "./types/lesson";
import "./types/mailing-list";

export const schema = builder.toSchema();
