"use client";

import { Underline } from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
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

  // Function to truncate content to 1000 words
  const truncateTo1000Words = useCallback((html: string) => {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    const words = plainText.trim().split(/\s+/);
    if (words.length <= 1000) return html;

    // Reconstruct HTML with only first 1000 words
    let truncatedHtml = "";
    let wordCount = 0;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const processNode = (node: Node) => {
      if (wordCount >= 1000) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const wordsInText = text
          .trim()
          .split(/\s+/)
          .filter((w: string) => w.length > 0);

        let accumulatedText = "";
        for (const word of wordsInText) {
          if (wordCount >= 1000) break;
          accumulatedText += (accumulatedText ? " " : "") + word;
          wordCount++;
        }

        if (accumulatedText) {
          truncatedHtml += accumulatedText;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const outerTagOpen = `<${tagName}${
          element.getAttribute("class")
            ? ` class="${element.getAttribute("class")}"`
            : ""
        }${
          element.getAttribute("style")
            ? ` style="${element.getAttribute("style")}"`
            : ""
        }>`;
        const outerTagClose = `</${tagName}>`;

        truncatedHtml += outerTagOpen;
        Array.from(node.childNodes).forEach((child) => processNode(child));
        truncatedHtml += outerTagClose;
      }
    };

    Array.from(doc.body.childNodes).forEach((child) => processNode(child));
    return truncatedHtml;
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

      // Handle word limit
      if (words > 1000) {
        isUpdatingContent.current = true;
        const truncatedHtml = truncateTo1000Words(html);
        editor.commands.setContent(truncatedHtml);
        console.warn(
          "Word limit of 1000 exceeded. Content has been truncated."
        );
        isUpdatingContent.current = false;
      }
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none p-2 sm:p-4 overflow-y-auto bg-white text-gray-800`,
        style: height
          ? `height: ${height}; min-height: ${height}; max-height: ${height}; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;`
          : `min-height: ${minHeight}; max-height: ${maxHeight}; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;`,
      },
      handlePaste: (view, event) => {
        const html = event.clipboardData?.getData("text/html");
        const text = event.clipboardData?.getData("text/plain");

        if (html || text) {
          const currentWordCount = editor ? countWords(editor.getHTML()) : 0;
          const pastedWordCount =
            countWords(html || "") + countWords(text || "");

          if (currentWordCount + pastedWordCount > 1000) {
            event.preventDefault();
            console.warn(
              `Pasting this content would exceed the 1000 word limit. You have ${
                1000 - currentWordCount
              } words remaining.`
            );
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const html = event.dataTransfer?.getData("text/html");
        const text = event.dataTransfer?.getData("text/plain");

        if (html || text) {
          const currentWordCount = editor ? countWords(editor.getHTML()) : 0;
          const droppedWordCount =
            countWords(html || "") + countWords(text || "");

          if (currentWordCount + droppedWordCount > 1000) {
            event.preventDefault();
            console.warn(
              `Dropping this content would exceed the 1000 word limit. You have ${
                1000 - droppedWordCount
              } words remaining.`
            );
            return true;
          }
        }
        return false;
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

  // Remove this useEffect since callbacks are now called directly in onUpdate

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

  // Auto-save draft

  // Initialize form with initial values when editing

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
        .word-count-warning {
          color: #f59e0b;
        }
        .word-count-error {
          color: #ef4444;
        }
      `}</style>

      <div className={`  transition-colors duration-200  text-gray-900 `}>
        <div className="w-full  ">
          {/* Title Input */}

          {/* Description Editor */}
          <div className="mb-4  ">
            <div className="flex justify-between items-center mb-2 px-1 sm:px-2">
              <div
                className={`text-xs sm:text-sm font-medium word-count-indicator ${
                  wordCount > 900
                    ? "word-count-error"
                    : wordCount > 800
                    ? "word-count-warning"
                    : "text-gray-600"
                }`}
              >
                {wordCount}/1000 words
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
                  className={`px-2 sm:px-4 py-1 sm:py-2 cursor-pointer rounded text-sm sm:text-base flex-shrink-0 ${
                    editor?.isActive("bold")
                      ? "bg-blue-700 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`px-2 sm:px-[18px] py-1 sm:py-2 cursor-pointer rounded text-sm sm:text-base flex-shrink-0 ${
                    editor?.isActive("italic")
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
                  className={`px-2 sm:px-4 py-1 sm:py-2 cursor-pointer rounded text-sm sm:text-base flex-shrink-0 ${
                    editor?.isActive("underline")
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
                  className={`px-2 sm:px-3 py-1 sm:py-2 cursor-pointer rounded flex-shrink-0 ${
                    editor?.isActive("bulletList")
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
                  className={`px-2 sm:px-3 py-1 sm:py-2 cursor-pointer rounded flex-shrink-0 ${
                    editor?.isActive("orderedList")
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
