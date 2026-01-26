"use client";

import { Underline } from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Link } from "@tiptap/extension-link";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
  MdFormatIndentDecrease,
  MdFormatIndentIncrease,
  MdImage,
  MdLink,
} from "react-icons/md";
import { HiChevronDown } from "react-icons/hi";
import { FontSize } from "./extensions/FontSize";
import { ImageWithAlignment } from "./extensions/ImageWithAlignment";


interface TipTapEditorProps {
  onChange?: (html: string) => void;
  resetTrigger?: boolean;
  content?: string;
  minHeight?: string;
  maxHeight?: string;
  height?: string;
  wordLimit?: number;
  showWordCount?: boolean;
  placeholder?: string;
  className?: string;
}

const TipTapEditor = ({
  onChange,
  resetTrigger = false,
  content = "",
  minHeight = "200px",
  maxHeight = "400px",
  height,
  wordLimit,
  showWordCount = true,
  placeholder = "Start typing...",
  className = "",
}: TipTapEditorProps) => {
  const [wordCount, setWordCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState("14");
  const [textColor, setTextColor] = useState("#000000");
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWrapStyleDropdown, setShowWrapStyleDropdown] = useState(false);
  const [fontSizeButtonRef, setFontSizeButtonRef] =
    useState<HTMLButtonElement | null>(null);
  const [colorButtonRef, setColorButtonRef] =
    useState<HTMLButtonElement | null>(null);
  const [wrapStyleButtonRef, setWrapStyleButtonRef] =
    useState<HTMLButtonElement | null>(null);

  const isUpdatingContent = useRef(false);
  const editorInitialized = useRef(false);

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

  // Font sizes
  const fontSizes = [
    "10",
    "12",
    "14",
    "16",
    "18",
    "20",
    "24",
    "28",
    "32",
    "36",
    "48",
  ];

  // Common colors
  const colors = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FF0000",
    "#FF6B60",
    "#FF1A60",
    "#0066FF",
    "#00CCFF",
    "#00FF00",
    "#FFCC00",
    "#FF9900",
    "#9900FF",
    "#FF00FF",
  ];

  // Memoize extensions
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          HTMLAttributes: {
            class: "list-disc pl-5 my-2",
          },
        },
        orderedList: {
          keepMarks: true,
          HTMLAttributes: {
            class: "list-decimal pl-5 my-2",
          },
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontSize,
      Color,
      ImageWithAlignment.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
    ],
    []
  );

  // Editor setup
  const editor = useEditor({
    extensions,
    content: content || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (isUpdatingContent.current) return;

      const html = editor.getHTML();
      const words = countWords(html);

      if (words !== wordCount) {
        setWordCount(words);
      }

      if (onChange) {
        onChange(html);
      }

      // Handle word limit
      if (wordLimit && words > wordLimit) {
        isUpdatingContent.current = true;
        // Get current selection
        const { from, to } = editor.state.selection;
        // Get content before truncation
        const currentContent = editor.getHTML();
        // Truncate to word limit
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = currentContent;
        const plainText = tempDiv.textContent || tempDiv.innerText || "";
        const wordsArray = plainText.trim().split(/\s+/);
        if (wordsArray.length > wordLimit) {
          const truncatedText = wordsArray.slice(0, wordLimit).join(" ");
          // Simple truncation - in production, you'd want to preserve HTML structure
          editor.commands.setContent(`<p>${truncatedText}</p>`);
        }
        // Restore selection
        editor.commands.setTextSelection({
          from: Math.min(from, editor.state.doc.content.size),
          to: Math.min(to, editor.state.doc.content.size),
        });
        isUpdatingContent.current = false;
        console.warn(
          `Word limit of ${wordLimit} exceeded. Content has been truncated.`
        );
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none p-4 overflow-y-auto bg-white text-gray-800`,
        "data-placeholder": placeholder,
        style: height
          ? `height: ${height}; min-height: ${height}; max-height: ${height}; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;`
          : `min-height: ${minHeight}; max-height: ${maxHeight}; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;`,
      },
      handlePaste: (view, event) => {
        if (wordLimit) {
          const html = event.clipboardData?.getData("text/html");
          const text = event.clipboardData?.getData("text/plain");
          if (html || text) {
            const currentWordCount = editor ? countWords(editor.getHTML()) : 0;
            const pastedWordCount =
              countWords(html || "") + countWords(text || "");
            if (currentWordCount + pastedWordCount > wordLimit) {
              event.preventDefault();
              console.warn(
                `Pasting this content would exceed the ${wordLimit} word limit. You have ${
                  wordLimit - currentWordCount
                } words remaining.`
              );
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  // Initialize editor content
  useEffect(() => {
    if (editor && !editorInitialized.current && content) {
      editor.commands.setContent(content);
      editorInitialized.current = true;
    }
  }, [editor, content]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger && editor) {
      setWordCount(0);
      editor.commands.setContent("");
      editorInitialized.current = false;
    }
  }, [resetTrigger, editor]);

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML() && !isUpdatingContent.current) {
      isUpdatingContent.current = true;
      editor.commands.setContent(content || "");
      isUpdatingContent.current = false;
    }
  }, [content, editor]);

  // Font size handler
  const handleFontSizeChange = (size: string) => {
    if (editor) {
      editor.chain().focus().setFontSize(size).run();
      setFontSize(size);
      setShowFontSizeDropdown(false);
    }
  };

  // Text color handler
  const handleColorChange = (color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
      setTextColor(color);
      setShowColorPicker(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showWrapStyleDropdown &&
        wrapStyleButtonRef &&
        !wrapStyleButtonRef.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".fixed.z-\\[101\\]")
      ) {
        setShowWrapStyleDropdown(false);
      }
      if (
        showFontSizeDropdown &&
        fontSizeButtonRef &&
        !fontSizeButtonRef.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".fixed.z-\\[100\\]")
      ) {
        setShowFontSizeDropdown(false);
      }
      if (
        showColorPicker &&
        colorButtonRef &&
        !colorButtonRef.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".fixed.z-\\[101\\]")
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWrapStyleDropdown, showFontSizeDropdown, showColorPicker, wrapStyleButtonRef, fontSizeButtonRef, colorButtonRef]);

  // Image handler
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          if (editor && src) {
            editor
              .chain()
              .focus()
              .setImage({
                src,
                alt: file.name,
              })
              .updateAttributes("image", { align: "center", wrapStyle: "square" })
              .run();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Link handler
  const handleLink = () => {
    if (editor) {
      const url = window.prompt("Enter URL:");
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  };

  if (!mounted) {
    return (
      <div
        className={`tiptap-editor-wrapper ${className}`}
        style={
          height
            ? { height, minHeight: height, maxHeight: height }
            : { minHeight, maxHeight }
        }
      >
        <div className="bg-[#FF1A60] h-12 rounded-t-lg"></div>
        <div
          className="bg-white p-4"
          style={
            height
              ? { height, minHeight: height, maxHeight: height }
              : { minHeight, maxHeight }
          }
        />
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        .tiptap-editor-wrapper {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
          position: relative;
        }
        .tiptap-editor-wrapper > .bg-\\[\\#FF1A60\\] {
          position: relative;
          overflow-x: auto;
          overflow-y: visible;
        }
        .tiptap-editor-wrapper .ProseMirror {
          outline: none;
          line-height: 1.6;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.75rem;
        }
        .tiptap-editor-wrapper .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          object-fit: contain;
          cursor: pointer;
        }
        /* Left aligned images with different wrap styles */
        .tiptap-editor-wrapper .ProseMirror img[data-align="left"] {
          float: left;
          clear: left;
          max-width: 50%;
          max-height: 400px;
          display: block;
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="left"][data-wrap="square"] {
          margin: 0.5rem 1rem 0.5rem 0;
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="left"][data-wrap="tight"],
        .tiptap-editor-wrapper .ProseMirror img[data-align="left"][data-wrap="through"] {
          shape-outside: url();
          shape-image-threshold: 0.5;
          shape-margin: 0.5rem;
          margin: 0.5rem 1rem 0.5rem 0;
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="left"][data-wrap="top-bottom"] {
          float: none;
          clear: both;
          display: block;
          margin: 1rem auto;
          max-width: 100%;
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="left"][data-wrap="behind"] {
          position: relative;
          z-index: -1;
          opacity: 0.5;
          margin: 0.5rem 1rem 0.5rem 0;
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="left"][data-wrap="in-front"] {
          position: relative;
          z-index: 10;
          margin: 0.5rem 1rem 0.5rem 0;
        }
        
        /* Right aligned images with different wrap styles */
        .tiptap-editor-wrapper .ProseMirror img[data-align="right"] {
          float: right;
          clear: right;
          max-width: 50%;
          max-height: 400px;
          display: block;
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="right"][data-wrap="square"] {
          margin: 0.5rem 0 0.5rem 1rem;
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="right"][data-wrap="tight"],
        .tiptap-editor-wrapper .ProseMirror img[data-align="right"][data-wrap="through"] {
          shape-outside: url();
          shape-image-threshold: 0.5;
          shape-margin: 0.5rem;
          margin: 0.5rem 0 0.5rem 1rem;
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="right"][data-wrap="top-bottom"] {
          float: none;
          clear: both;
          display: block;
          margin: 1rem auto;
          max-width: 100%;
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="right"][data-wrap="behind"] {
          position: relative;
          z-index: -1;
          opacity: 0.5;
          margin: 0.5rem 0 0.5rem 1rem;
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="right"][data-wrap="in-front"] {
          position: relative;
          z-index: 10;
          margin: 0.5rem 0 0.5rem 1rem;
        }
        
        /* Dynamic wrap margin support */
        .tiptap-editor-wrapper .ProseMirror img[data-wrap-margin] {
          --wrap-margin: attr(data-wrap-margin);
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="left"][data-wrap="square"][data-wrap-margin] {
          margin-right: var(--wrap-margin, 1rem);
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="right"][data-wrap="square"][data-wrap-margin] {
          margin-left: var(--wrap-margin, 1rem);
        }
        .tiptap-editor-wrapper .ProseMirror img[data-align="center"],
        .tiptap-editor-wrapper .ProseMirror img:not([data-align]) {
          display: block !important;
          float: none !important;
          clear: both !important;
          margin-left: auto !important;
          margin-right: auto !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
          max-width: 100% !important;
          max-height: 400px;
        }
        .tiptap-editor-wrapper .ProseMirror p {
          overflow: hidden;
          clear: both;
        }
        .tiptap-editor-wrapper .ProseMirror p:has(img[data-align="left"]) {
          text-align: left;
        }
        .tiptap-editor-wrapper .ProseMirror p:has(img[data-align="right"]) {
          text-align: right;
        }
        .tiptap-editor-wrapper .ProseMirror p:has(img[data-align="center"]),
        .tiptap-editor-wrapper .ProseMirror p:has(img:not([data-align])) {
          text-align: left;
        }
        .tiptap-editor-wrapper .ProseMirror p:has(img[data-align="center"]) img,
        .tiptap-editor-wrapper .ProseMirror p:has(img:not([data-align])) img {
          margin-left: auto !important;
          margin-right: auto !important;
        }
        .tiptap-editor-wrapper .ProseMirror figure {
          margin: 1rem 0;
          text-align: center;
        }
        .tiptap-editor-wrapper .ProseMirror figure img {
          display: block;
          margin: 0 auto;
        }
        @media (max-width: 640px) {
          .tiptap-editor-wrapper .ProseMirror img {
            max-height: 250px;
          }
          .tiptap-editor-wrapper .ProseMirror img[data-align="left"],
          .tiptap-editor-wrapper .ProseMirror img[data-align="right"] {
            max-width: 45%;
            max-height: 200px;
          }
        }
        @media (min-width: 640px) {
          .tiptap-editor-wrapper .ProseMirror {
            padding: 1rem;
          }
        }
        .tiptap-editor-wrapper
          .ProseMirror
          p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
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
        .tiptap-toolbar-button {
          transition: all 0.2s ease;
        }
        .tiptap-toolbar-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .tiptap-toolbar-button.active {
          background-color: rgba(255, 255, 255, 0.2);
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 640px) {
          .tiptap-editor-wrapper .ProseMirror {
            font-size: 16px;
            -webkit-text-size-adjust: 100%;
          }
          .tiptap-toolbar-button {
            min-height: 36px;
            min-width: 36px;
          }
        }
        .touch-manipulation {
          touch-action: manipulation;
        }
      `}</style>

      <div className={`tiptap-editor-wrapper ${className}`}>
        {/* Toolbar */}
        <div className="bg-[#FF1A60] flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-2 sm:py-2 overflow-x-auto overflow-y-visible scrollbar-hide">
          {/* Font Size Dropdown */}
          <div className="relative flex-shrink-0 z-30">
            <button
              ref={setFontSizeButtonRef}
              type="button"
              onClick={() => {
                setShowColorPicker(false); // Close color picker if open
                setShowFontSizeDropdown(!showFontSizeDropdown);
              }}
              className="tiptap-toolbar-button px-2 sm:px-2 py-1.5 sm:py-1.5 rounded text-white text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1 min-w-[45px] sm:min-w-[50px] justify-between touch-manipulation"
            >
              <span>{fontSize}</span>
              <HiChevronDown
                size={12}
                className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
              />
            </button>
            {showFontSizeDropdown && fontSizeButtonRef && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowFontSizeDropdown(false)}
                />
                <div
                  className="fixed bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-[101] max-h-64 overflow-y-auto min-w-[80px] sm:min-w-[100px] max-w-[90vw] sm:max-w-[200px] py-1"
                  style={{
                    top: `${
                      fontSizeButtonRef.getBoundingClientRect().bottom + 4
                    }px`,
                    left: `${Math.max(
                      4,
                      Math.min(
                        fontSizeButtonRef.getBoundingClientRect().left,
                        window.innerWidth - 200
                      )
                    )}px`,
                  }}
                >
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFontSizeChange(size);
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-semibold hover:bg-[#FF1A60] hover:text-white transition-all duration-150 ${
                        fontSize === size
                          ? "bg-[#FF1A60] text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Text Color Picker */}
          <div className="relative flex-shrink-0 z-30">
            <button
              ref={setColorButtonRef}
              type="button"
              onClick={() => {
                setShowFontSizeDropdown(false); // Close font size dropdown if open
                setShowColorPicker(!showColorPicker);
              }}
              className="tiptap-toolbar-button px-2 sm:px-2 py-1.5 sm:py-1.5 rounded text-white text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1 touch-manipulation"
            >
              <div
                className="w-4 h-4 sm:w-4 sm:h-4 rounded border border-white flex-shrink-0"
                style={{ backgroundColor: textColor }}
              />
              <HiChevronDown
                size={12}
                className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
              />
            </button>
            {showColorPicker && colorButtonRef && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowColorPicker(false)}
                />
                <div
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[101] p-2 sm:p-3 min-w-[180px] sm:min-w-[200px] max-w-[90vw] sm:max-w-none"
                  style={{
                    top: `${
                      colorButtonRef.getBoundingClientRect().bottom + 4
                    }px`,
                    left: `${Math.max(
                      4,
                      Math.min(
                        colorButtonRef.getBoundingClientRect().left,
                        window.innerWidth - 220
                      )
                    )}px`,
                  }}
                >
                  <div className="mb-2 sm:mb-3">
                    <label className="text-[10px] sm:text-xs font-medium text-gray-700 mb-1.5 sm:mb-2 block">
                      Preset Colors
                    </label>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleColorChange(color);
                          }}
                          className="w-5 h-5 sm:w-7 sm:h-7 rounded border-2 border-gray-300 hover:scale-110 hover:border-gray-400 transition-all"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-medium text-gray-700 mb-1.5 sm:mb-2 block">
                      Custom Color
                    </label>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded border border-gray-300 cursor-pointer flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => {
                          if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                            handleColorChange(e.target.value);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#FF1A60] focus:border-transparent"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 sm:h-6 bg-white/30 mx-0.5 sm:mx-1" />

          {/* Formatting Buttons */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`tiptap-toolbar-button px-2.5 sm:px-3 py-1.5 sm:py-1.5 rounded text-white text-xs sm:text-sm font-bold touch-manipulation min-w-[32px] ${
              editor.isActive("bold") ? "active" : ""
            }`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`tiptap-toolbar-button px-2 sm:px-3 py-1 sm:py-1.5 rounded text-white text-xs sm:text-sm italic ${
              editor.isActive("italic") ? "active" : ""
            }`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`tiptap-toolbar-button px-2 sm:px-3 py-1 sm:py-1.5 rounded text-white text-xs sm:text-sm underline ${
              editor.isActive("underline") ? "active" : ""
            }`}
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`tiptap-toolbar-button px-2 sm:px-3 py-1 sm:py-1.5 rounded text-white text-xs sm:text-sm line-through ${
              editor.isActive("strike") ? "active" : ""
            }`}
            title="Strikethrough"
          >
            S
          </button>

          {/* Divider */}
          <div className="w-px h-5 sm:h-6 bg-white/30 mx-0.5 sm:mx-1" />

          {/* Alignment Buttons */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`tiptap-toolbar-button p-1.5 sm:p-1.5 rounded text-white touch-manipulation min-w-[36px] ${
              editor.isActive({ textAlign: "left" }) ? "active" : ""
            }`}
            title="Align Left"
          >
            <MdFormatAlignLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`tiptap-toolbar-button p-1.5 sm:p-1.5 rounded text-white touch-manipulation min-w-[36px] ${
              editor.isActive({ textAlign: "center" }) ? "active" : ""
            }`}
            title="Align Center"
          >
            <MdFormatAlignCenter
              size={16}
              className="sm:w-[18px] sm:h-[18px]"
            />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`tiptap-toolbar-button p-1.5 sm:p-1.5 rounded text-white touch-manipulation min-w-[36px] ${
              editor.isActive({ textAlign: "right" }) ? "active" : ""
            }`}
            title="Align Right"
          >
            <MdFormatAlignRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`tiptap-toolbar-button p-1.5 sm:p-1.5 rounded text-white touch-manipulation min-w-[36px] ${
              editor.isActive({ textAlign: "justify" }) ? "active" : ""
            }`}
            title="Justify"
          >
            <MdFormatAlignJustify
              size={16}
              className="sm:w-[18px] sm:h-[18px]"
            />
          </button>

          {/* Divider */}
          <div className="w-px h-5 sm:h-6 bg-white/30 mx-0.5 sm:mx-1" />

          {/* List Buttons */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`tiptap-toolbar-button p-1.5 sm:p-1.5 rounded text-white touch-manipulation min-w-[36px] ${
              editor.isActive("bulletList") ? "active" : ""
            }`}
            title="Bullet List"
          >
            <MdFormatListBulleted
              size={16}
              className="sm:w-[18px] sm:h-[18px]"
            />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`tiptap-toolbar-button p-1.5 sm:p-1.5 rounded text-white touch-manipulation min-w-[36px] ${
              editor.isActive("orderedList") ? "active" : ""
            }`}
            title="Numbered List"
          >
            <MdFormatListNumbered
              size={16}
              className="sm:w-[18px] sm:h-[18px]"
            />
          </button>

          {/* Divider */}
          <div className="w-px h-5 sm:h-6 bg-white/30 mx-0.5 sm:mx-1" />

          {/* Indentation Buttons */}
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().liftListItem("listItem").run()
            }
            className="tiptap-toolbar-button p-1 sm:p-1.5 rounded text-white"
            title="Decrease Indent"
          >
            <MdFormatIndentDecrease
              size={16}
              className="sm:w-[18px] sm:h-[18px]"
            />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().sinkListItem("listItem").run()
            }
            className="tiptap-toolbar-button p-1 sm:p-1.5 rounded text-white"
            title="Increase Indent"
          >
            <MdFormatIndentIncrease
              size={16}
              className="sm:w-[18px] sm:h-[18px]"
            />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Divider */}
          <div className="w-px h-5 sm:h-6 bg-white/30 mx-0.5 sm:mx-1" />

          {/* Image Alignment Buttons (only show when image is selected) */}
          {editor?.isActive("image") && (
            <>
              <div className="w-px h-5 sm:h-6 bg-white/30 mx-0.5 sm:mx-1" />
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().updateAttributes("image", { align: "left" }).run();
                }}
                className={`tiptap-toolbar-button p-1 sm:p-1.5 rounded text-white touch-manipulation min-w-[36px] ${
                  editor.getAttributes("image").align === "left" ? "active" : ""
                }`}
                title="Align Image Left (Text Wraps)"
              >
                <MdFormatAlignLeft
                  size={16}
                  className="sm:w-[18px] sm:h-[18px]"
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().updateAttributes("image", { align: "center" }).run();
                }}
                className={`tiptap-toolbar-button p-1 sm:p-1.5 rounded text-white touch-manipulation min-w-[36px] ${
                  (editor.getAttributes("image").align === "center" ||
                  !editor.getAttributes("image").align ||
                  editor.getAttributes("image").align === undefined) ? "active" : ""
                }`}
                title="Align Image Center"
              >
                <MdFormatAlignCenter
                  size={16}
                  className="sm:w-[18px] sm:h-[18px]"
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().updateAttributes("image", { align: "right" }).run();
                }}
                className={`tiptap-toolbar-button p-1 sm:p-1.5 rounded text-white touch-manipulation min-w-[36px] ${
                  editor.getAttributes("image").align === "right" ? "active" : ""
                }`}
                title="Align Image Right (Text Wraps)"
              >
                <MdFormatAlignRight
                  size={16}
                  className="sm:w-[18px] sm:h-[18px]"
                />
              </button>
              {/* Wrap Style Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  ref={(el) => setWrapStyleButtonRef(el)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (editor?.isActive("image")) {
                      setShowWrapStyleDropdown(!showWrapStyleDropdown);
                      setShowFontSizeDropdown(false);
                      setShowColorPicker(false);
                    }
                  }}
                  className="tiptap-toolbar-button px-2 sm:px-3 py-1 sm:py-1.5 rounded text-white text-xs sm:text-sm touch-manipulation flex items-center gap-1"
                  title="Text Wrap Style"
                >
                  <span className="hidden sm:inline">Wrap</span>
                  <HiChevronDown size={14} className="sm:w-[16px] sm:h-[16px]" />
                </button>
                {showWrapStyleDropdown && wrapStyleButtonRef && editor?.isActive("image") && (
                  <div
                    className="fixed z-[101] bg-white border border-gray-300 rounded-lg shadow-lg mt-1 min-w-[140px] sm:min-w-[160px]"
                    style={{
                      top: `${wrapStyleButtonRef.getBoundingClientRect().bottom + window.scrollY + 4}px`,
                      left: `${wrapStyleButtonRef.getBoundingClientRect().left + window.scrollX}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[
                      { value: "square", label: "Square" },
                      { value: "tight", label: "Tight" },
                      { value: "through", label: "Through" },
                      { value: "top-bottom", label: "Top & Bottom" },
                      { value: "behind", label: "Behind Text" },
                      { value: "in-front", label: "In Front of Text" },
                    ].map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => {
                          editor.chain().focus().updateAttributes("image", { wrapStyle: style.value }).run();
                          setShowWrapStyleDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-base font-semibold hover:bg-gray-100 transition-colors ${
                          editor.getAttributes("image").wrapStyle === style.value ||
                          (!editor.getAttributes("image").wrapStyle && style.value === "square")
                            ? "bg-gray-50 text-[#FF1A60]"
                            : "text-gray-900"
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-px h-5 sm:h-6 bg-white/30 mx-0.5 sm:mx-1" />
            </>
          )}

          {/* Media Buttons */}
          <button
            type="button"
            onClick={handleImageUpload}
            className="tiptap-toolbar-button p-1 sm:p-1.5 rounded text-white"
            title="Insert Image"
          >
            <MdImage size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button
            type="button"
            onClick={handleLink}
            className="tiptap-toolbar-button p-1 sm:p-1.5 rounded text-white"
            title="Insert Link"
          >
            <MdLink size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        {/* Word Count */}
        {showWordCount && wordLimit && (
          <div className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-50 border-b border-gray-200 flex justify-end">
            <span
              className={`text-[10px] sm:text-xs font-medium ${
                wordCount > wordLimit * 0.9
                  ? "text-red-600"
                  : wordCount > wordLimit * 0.8
                  ? "text-orange-600"
                  : "text-gray-600"
              }`}
            >
              {wordCount}/{wordLimit} words
            </span>
          </div>
        )}

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          style={
            height
              ? { height, minHeight: height, maxHeight: height }
              : { minHeight, maxHeight }
          }
        />
      </div>
    </>
  );
};

export default TipTapEditor;
