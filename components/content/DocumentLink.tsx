import { FileText, Download } from "lucide-react";

interface DocumentLinkProps {
  href: string;
  label: string;
  description?: string;
  fileSize?: string;
}

const FILE_ICON_COLORS: Record<string, string> = {
  pdf: "text-red-600",
  doc: "text-primary",
  docx: "text-primary",
  xls: "text-secondary",
  xlsx: "text-secondary",
};

function getExtension(href: string): string {
  const ext = href.split(".").pop()?.toLowerCase() || "";
  return ext;
}

export function DocumentLink({
  href,
  label,
  description,
  fileSize,
}: DocumentLinkProps) {
  const ext = getExtension(href);
  const iconColor = FILE_ICON_COLORS[ext] || "text-stone";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      className="flex items-center gap-3 p-4 rounded-lg border border-stone/20 hover:border-accent hover:bg-cream/50 transition-colors group not-prose"
    >
      <FileText className={`w-8 h-8 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-bark group-hover:text-accent truncate">
          {label}
        </p>
        {(description || fileSize) && (
          <p className="text-sm text-stone truncate">
            {description}
            {description && fileSize && " · "}
            {fileSize && <span className="uppercase">{ext}</span>}
            {fileSize && ` · ${fileSize}`}
          </p>
        )}
      </div>
      <Download className="w-5 h-5 text-stone/70 group-hover:text-accent flex-shrink-0" />
    </a>
  );
}

DocumentLink.displayName = "DocumentLink";
