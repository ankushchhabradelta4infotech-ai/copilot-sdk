import { memo, ComponentProps } from "react";
import { Streamdown, LinkSafetyConfig } from "streamdown";
import { code } from "@streamdown/code";
import remarkGfm from "remark-gfm";

export type MarkdownProps = {
  children: string;
  id?: string;
  className?: string;
  isStreaming?: boolean;
  /** Link safety modal configuration. Disabled by default. */
  linkSafety?: LinkSafetyConfig;
  /**
   * How raw HTML in the markdown is treated.
   * - "literal" (default): shown as typed. A chat surface shows text; a person pasting
   *   `<script>` wants to see it, and a model asked to "send this snippet" returns it as
   *   text too — often unfenced. Under "render" both vanish (see below).
   * - "render": parsed into elements. Opt in only for trusted, deliberately-HTML content.
   */
  rawHtml?: "render" | "literal";
};

// Streamdown always runs rehype-raw, so raw HTML in the markdown becomes real DOM: the
// sanitizer then strips `<script>` outright — an assistant reply consisting of a script tag
// renders as an EMPTY bubble — and lets things like `<input>` through as live elements, which
// for model output is also a prompt-injection surface. Neither `skipHtml` nor `allowedTags`
// prevents that — both act after the raw pass. The one hook that runs BEFORE it is remark, so
// convert html nodes to text there. Fenced and inline code are code nodes, not html nodes, so
// they are untouched.
type MdNode = { type: string; children?: MdNode[] };
const remarkHtmlAsText = () => (tree: MdNode) => {
  const walk = (node: MdNode) => {
    if (node.type === "html") {
      node.type = "text";
      return;
    }
    node.children?.forEach(walk);
  };
  walk(tree);
};

// remarkGfm must be repeated here: Streamdown REPLACES its default remarkPlugins with whatever
// this prop passes (it does not merge), and that default is exactly [remarkGfm]. Omitting it
// silently drops tables, strikethrough, autolinks and task lists from every message.
const literalHtmlPlugins = [remarkGfm, remarkHtmlAsText];

// Normalized heading component for chat UI (same size, just bold)
// Ignore Streamdown's className to prevent its text-3xl etc. from overriding
const createHeading = (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
  const HeadingComponent = ({
    children,
    className: _,
    ...props
  }: ComponentProps<typeof Tag>) => (
    <Tag className="text-[1em] font-semibold my-2 first:mt-0" {...props}>
      {children}
    </Tag>
  );
  HeadingComponent.displayName = Tag.toUpperCase();
  return HeadingComponent;
};

const headingComponents = {
  h1: createHeading("h1"),
  h2: createHeading("h2"),
  h3: createHeading("h3"),
  h4: createHeading("h4"),
  h5: createHeading("h5"),
  h6: createHeading("h6"),
};

function MarkdownComponent({
  children,
  className,
  isStreaming = false,
  linkSafety = { enabled: false },
  rawHtml = "literal",
}: MarkdownProps) {
  return (
    <div className={className}>
      <Streamdown
        plugins={{ code }}
        remarkPlugins={rawHtml === "literal" ? literalHtmlPlugins : undefined}
        isAnimating={isStreaming}
        components={headingComponents}
        linkSafety={linkSafety}
      >
        {children}
      </Streamdown>
    </div>
  );
}

const Markdown = memo(MarkdownComponent);
Markdown.displayName = "Markdown";

export { Markdown };
export type { LinkSafetyConfig } from "streamdown";
