import { Image } from "@tiptap/extension-image";

export const ImageWithAlignment = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (element) => {
          const dataAlign = element.getAttribute("data-align");
          const floatStyle = element.style.float;
          
          if (dataAlign) {
            return dataAlign;
          }
          
          if (floatStyle === "left") {
            return "left";
          }
          
          if (floatStyle === "right") {
            return "right";
          }
          
          return "center";
        },
        renderHTML: (attributes) => {
          const align = attributes.align || "center";
          
          if (align === "center") {
            return {
              "data-align": "center",
              style: "display: block; margin-left: auto; margin-right: auto; max-width: 100%;",
            };
          }
          
          if (align === "left") {
            return {
              "data-align": "left",
              style: "float: left; display: block; margin: 0.5rem 1rem 0.5rem 0; max-width: 50%;",
            };
          }
          
          if (align === "right") {
            return {
              "data-align": "right",
              style: "float: right; display: block; margin: 0.5rem 0 0.5rem 1rem; max-width: 50%;",
            };
          }
          
          return {
            "data-align": "center",
            style: "display: block; margin-left: auto; margin-right: auto; max-width: 100%;",
          };
        },
      },
      wrapStyle: {
        default: "square",
        parseHTML: (element) => {
          return element.getAttribute("data-wrap") || "square";
        },
        renderHTML: (attributes) => {
          return {
            "data-wrap": attributes.wrapStyle || "square",
          };
        },
      },
      wrapMargin: {
        default: "0.5rem",
        parseHTML: (element) => {
          const margin = element.getAttribute("data-wrap-margin");
          return margin || "0.5rem";
        },
        renderHTML: (attributes) => {
          return {
            "data-wrap-margin": attributes.wrapMargin || "0.5rem",
          };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("width") || element.style.width;
          return width;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width};`,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute("height") || element.style.height;
          return height;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
            style: `height: ${attributes.height};`,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageAlign: (align: "left" | "right" | "center") => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: { commands: any }) => {
          return commands.updateAttributes("image", { align });
        },
      setImageWrapStyle: (wrapStyle: "square" | "tight" | "through" | "top-bottom" | "behind" | "in-front") => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: { commands: any }) => {
          return commands.updateAttributes("image", { wrapStyle });
        },
      setImageWrapMargin: (margin: string) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: { commands: any }) => {
          return commands.updateAttributes("image", { wrapMargin: margin });
        },
      setImageSize: (width: string, height?: string) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: { commands: any }) => {
          return commands.updateAttributes("image", { width, height });
        },
    };
  },
});
