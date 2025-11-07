"use client";

import { useState } from "react";

interface CodeFile {
  name: string;
  path: string;
  code: string;
  language?: string;
}

interface CodeViewerProps {
  files: CodeFile[];
  title?: string;
}

export function CodeViewer({ files, title = "Generated Code" }: CodeViewerProps) {
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(
    files.length > 0 ? files[0] : null
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!selectedFile) return;

    try {
      await navigator.clipboard.writeText(selectedFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
        return "javascript";
      case "css":
        return "css";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "sql":
        return "sql";
      default:
        return "plaintext";
    }
  };

  if (files.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">No code files generated yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="grid md:grid-cols-[250px_1fr]">
        {/* File List */}
        <div className="border-r border-gray-200 bg-gray-50 max-h-[600px] overflow-y-auto">
          <div className="p-2 space-y-1">
            {files.map((file, index) => (
              <button
                key={index}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedFile?.path === file.path
                    ? "bg-blue-100 text-blue-900 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {getLanguageFromPath(file.path)}
                  </span>
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="text-xs text-gray-500 truncate">{file.path}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Code Display */}
        <div className="bg-gray-900">
          {selectedFile && (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {selectedFile.path}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded">
                    {getLanguageFromPath(selectedFile.path)}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>

              <div className="max-h-[500px] overflow-auto">
                <pre className="p-4 text-sm">
                  <code className="text-gray-100 font-mono">
                    {selectedFile.code}
                  </code>
                </pre>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {files.length} file{files.length !== 1 ? "s" : ""} generated
        </span>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          Download All
        </button>
      </div>
    </div>
  );
}
