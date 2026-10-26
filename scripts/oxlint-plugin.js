// Project lint rules oxlint can't express with config (loaded via jsPlugins in .oxlintrc.json)
import path from "node:path";

const src = path.resolve("src");

// "features/teachers/lib/x.ts" → "teachers"
const featureOf = (file) => {
  const [dir, name] = path.relative(src, file).split(path.sep);
  return dir === "features" ? name : undefined;
};

const resolve = (from, specifier) => {
  if (specifier.startsWith("@/")) return path.join(src, specifier.slice(2));
  if (specifier.startsWith("."))
    return path.resolve(path.dirname(from), specifier);
};

const featureBoundaries = {
  meta: { type: "problem" },
  create(context) {
    const own = featureOf(context.filename);
    if (!own) return {};
    const check = (source) => {
      if (typeof source?.value !== "string") return;
      const target = resolve(context.filename, source.value);
      const other = target && featureOf(target);
      if (other && other !== own) {
        context.report({
          node: source,
          message: `Feature "${own}" can't import feature "${other}". Move shared code to src/<kind>/, and let routes compose features.`,
        });
      }
    };
    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
    };
  },
};

export default {
  meta: { name: "vyzed" },
  rules: { "feature-boundaries": featureBoundaries },
};
