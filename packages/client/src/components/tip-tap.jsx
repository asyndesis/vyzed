"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Paintbrush,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TextStyle from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Text Color extension
const TextColor = Extension.create({
  name: "textColor",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          color: {
            default: null,
            parseHTML: (element) => element.style.color,
            renderHTML: (attributes) => {
              if (!attributes.color) {
                return {};
              }
              return {
                style: `color: ${attributes.color}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextColor:
        (color) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { color }).run();
        },
      unsetTextColor:
        () =>
        ({ chain }) => {
          return chain().setMark("textStyle", { color: null }).run();
        },
    };
  },
});

// Colors that work well in both light and dark mode
const colors = [
  { name: "Default", value: "currentColor" },
  { name: "Red", value: "#ef4444" }, // red-500
  { name: "Orange", value: "#f97316" }, // orange-500
  { name: "Brown", value: "#a16207" }, // amber-800
  { name: "Yellow", value: "#eab308" }, // yellow-500
  { name: "Green", value: "#22c55e" }, // green-500
  { name: "Teal", value: "#14b8a6" }, // teal-500
  { name: "Blue", value: "#3b82f6" }, // blue-500
  { name: "Indigo", value: "#6366f1" }, // indigo-500
  { name: "Purple", value: "#a855f7" }, // purple-500
  { name: "Pink", value: "#ec4899" }, // pink-500
  { name: "Rose", value: "#f43f5e" }, // rose-500
];

const EditorSkeleton = () => (
  <div className="border rounded-md overflow-hidden animate-pulse">
    <div className="flex items-center gap-1 border-b bg-muted/50 p-1">
      <div className="flex gap-1">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
    <div className="p-4 min-h-[340px]">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-4/5 mb-4" />
      <Skeleton className="h-6 w-2/3 mb-2" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-5/6 mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
    </div>
  </div>
);

const Tiptap = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      TextColor,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose focus:outline-none min-h-[300px] max-w-none",
          "dark:prose-invert"
        ),
      },
    },
  });

  if (!editor) {
    return <EditorSkeleton />;
  }

  return (
    <div className="border rounded-md overflow-hidden dark:border-border">
      <div className="flex items-center gap-1 border-b bg-muted/50 p-1 dark:bg-muted/20">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="icon"
          type="button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="icon"
          type="button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          variant={
            editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
          }
          size="icon"
          type="button"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          size="icon"
          type="button"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          size="icon"
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="text-foreground"
            >
              <Paintbrush className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-6 gap-1">
              {colors.map((color) => (
                <Button
                  key={color.value}
                  onClick={() => {
                    if (color.value === "currentColor") {
                      editor.chain().focus().unsetTextColor().run();
                    } else {
                      editor.chain().focus().setTextColor(color.value).run();
                    }
                    setOpen(false);
                  }}
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="p-1 h-8 w-8 flex items-center justify-center"
                  title={color.name}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full",
                      color.value === "currentColor" &&
                        "border border-dashed border-foreground/30"
                    )}
                    style={{
                      backgroundColor:
                        color.value !== "currentColor"
                          ? color.value
                          : "transparent",
                    }}
                  />
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="p-4 dark:bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
