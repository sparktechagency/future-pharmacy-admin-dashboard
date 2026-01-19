"use client";

import { Underline } from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdFormatListBulleted } from "react-icons/md";
import { VscListOrdered } from "react-icons/vsc";

interface TipTapEditorProps {
  handleJobDescription?: (description: string) => void;
  handleMustHaveQualifications?: (description: string) => void;
  handlePreferredQualifications?: (description: string) => void;
  resetTrigger?: boolean;
  description?: string;
  minHeight?: string;
  maxHeight?: string;
  height?: string;
}

const TipTapEditor = ({
  handleJobDescription,
  handleMustHaveQualifications,
  handlePreferredQualifications,
  resetTrigger = false,
  description = "",
  minHeight = "200px",
  maxHeight = "400px",
  height,
}: TipTapEditorProps) => {
  const [localDescription, setLocalDescription] = useState(description);
  const [wordCount, setWordCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Add refs to track editor state and prevent unnecessary updates
  const editorInitialized = useRef(false);
  const isUpdatingContent = useRef(false);
  const lastCursorPosition = useRef({ from: 0, to: 0 });

  // Update local description when prop changes
  useEffect(() => {
    setLocalDescription(description || "");
  }, [description]);

  // Handle SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Utility function to count words
  const countWords = useCallback((html: string) => {
    if (!html) return 0;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    const words = plainText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length;
  }, []);

  // Memoize extensions to prevent duplicate extension warnings
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          HTMLAttributes: {
            class: "list-disc pl-5",
          },
        },
        orderedList: {
          keepMarks: true,
          HTMLAttributes: {
            class: "list-decimal pl-5",
          },
        },
      }),
      Underline,
    ],
    []
  );

  // Tiptap Editor Setup with minimal re-renders
  const editor = useEditor({
    extensions,
    content: localDescription || "",
    immediatelyRender: false, // Prevent SSR hydration issues
    onUpdate: ({ editor }) => {
      // Prevent recursive updates
      if (isUpdatingContent.current) return;

      const html = editor.getHTML();
      const words = countWords(html);

      // Update word count without causing re-render
      if (words !== wordCount) {
        setWordCount(words);
      }

      // Call callbacks without state updates
      if (handleJobDescription) {
        handleJobDescription(html);
      }
      if (handleMustHaveQualifications) {
        handleMustHaveQualifications(html);
      }
      if (handlePreferredQualifications) {
        handlePreferredQualifications(html);
      }
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none p-2 sm:p-4 overflow-y-auto bg-white text-gray-800`,
        style: height
          ? `height: ${height}; min-height: ${height}; max-height: ${height}; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;`
          : `min-height: ${minHeight}; max-height: ${maxHeight}; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;`,
      },
    },
    // Add onSelectionUpdate to track cursor position
    onSelectionUpdate: ({ editor }) => {
      if (!isUpdatingContent.current) {
        const { from, to } = editor.state.selection;
        lastCursorPosition.current = { from, to };
      }
    },
  });

  // Minimal useEffect for initialization only
  useEffect(() => {
    if (editor && !editorInitialized.current) {
      // Initial setup only
      if (localDescription) {
        editor.commands.setContent(localDescription);
      }
      editorInitialized.current = true;
    }
  }, [editor, localDescription]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger && editor) {
      setLocalDescription("");
      setWordCount(0);
      editor.commands.setContent("");
      editorInitialized.current = false;
    }
  }, [resetTrigger, editor]);

  // Handle dark mode change
  useEffect(() => {
    if (editor) {
      const updateClasses = () => {
        const editorWrapper = document.querySelector(".tiptap-editor-wrapper");
        if (editorWrapper) {
          editorWrapper.className = `tiptap-editor-wrapper rounded-lg border
            border-gray-300
          }`;
        }
        const content = editor.view.dom;
        content.className = `bg-white text-gray-800 p-2 sm:p-4 md:p-6 sm:p-4 min-h-[200px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px] max-h-[250px] sm:max-h-[350px] md:max-h-[450px] lg:max-h-[550px] xl:max-h-[650px]  overflow-y-auto focus:outline-none`;
      };
      updateClasses();
    }
  }, [editor]);

  return (
    <>
      <style jsx global>{`
        .tiptap-editor-wrapper {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          overflow: hidden;
          overflow-x: hidden;
          transition: border-color 0.2s;
        }
        .tiptap-editor-wrapper .ProseMirror {
          padding: 0.5rem;
          outline: none;
          line-height: 1.6;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          overflow-x: hidden;
        }
        @media (min-width: 640px) {
          .tiptap-editor-wrapper .ProseMirror {
            padding: 1rem;
          }
        }
        @media (min-width: 768px) {
          .tiptap-editor-wrapper .ProseMirror {
            padding: 1.5rem;
          }
        }
        .tiptap-editor-wrapper .ProseMirror::-webkit-scrollbar {
          width: 8px;
        }
        .tiptap-editor-wrapper .ProseMirror::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .tiptap-editor-wrapper .ProseMirror::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .tiptap-editor-wrapper .ProseMirror::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .tiptap-editor-wrapper .ProseMirror {
          scrollbar-width: thin;
          scrollbar-color: #6b7280 #374151;
        }
        .word-count-indicator {
          transition: color 0.2s ease-in-out;
        }
      `}</style>

      <div className={`  transition-colors duration-200  text-gray-900 `}>
        <div className="w-full  ">
          {/* Title Input */}

          {/* Description Editor */}
          <div className="mb-4  ">
            <div className="flex justify-between items-center mb-2 px-1 sm:px-2">
              <div className={`text-xs sm:text-sm font-medium word-count-indicator text-gray-600`}>
                {wordCount} words
              </div>
            </div>
            <div
              className="tiptap-editor-wrapper"
              onPaste={(e) => {
                if (e.clipboardData.files.length > 0) {
                  e.preventDefault();
                  console.warn(
                    "Image pasting is not allowed. Please use the image upload section."
                  );
                }
              }}
            >
              {/* Toolbar */}
              <div
                className={`flex gap-1 px-1 sm:px-2 py-2 sm:py-3 border-b ${"bg-gray-50 border-gray-200"} overflow-x-auto`}
              >
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`px-2 sm:px-4 py-1 sm:py-2 cursor-pointer rounded text-sm sm:text-base flex-shrink-0 ${editor?.isActive("bold")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-gray-200"
                    }`}
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`px-2 sm:px-[18px] py-1 sm:py-2 cursor-pointer rounded text-sm sm:text-base flex-shrink-0 ${editor?.isActive("italic")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-gray-200"
                    }`}
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleUnderline().run()
                  }
                  className={`px-2 sm:px-4 py-1 sm:py-2 cursor-pointer rounded text-sm sm:text-base flex-shrink-0 ${editor?.isActive("underline")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-gray-200"
                    }`}
                >
                  <u>U</u>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  className={`px-2 sm:px-3 py-1 sm:py-2 cursor-pointer rounded flex-shrink-0 ${editor?.isActive("bulletList")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-gray-200"
                    }`}
                >
                  <MdFormatListBulleted size={16} className="sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  className={`px-2 sm:px-3 py-1 sm:py-2 cursor-pointer rounded flex-shrink-0 ${editor?.isActive("orderedList")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-gray-200"
                    }`}
                >
                  <VscListOrdered size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Editor */}
              {mounted ? (
                <EditorContent
                  editor={editor}
                  className="bg-gray-50 border border-gray-200 rounded-lg overflow-x-hidden"
                  style={
                    height
                      ? {
                        height,
                        minHeight: height,
                        maxHeight: height,
                        overflowX: "hidden",
                      }
                      : { minHeight, maxHeight, overflowX: "hidden" }
                  }
                />
              ) : (
                <div
                  className="p-2 sm:p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-lg overflow-x-hidden"
                  style={
                    height
                      ? {
                        height,
                        minHeight: height,
                        maxHeight: height,
                        overflowX: "hidden",
                      }
                      : { minHeight, maxHeight, overflowX: "hidden" }
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TipTapEditor;