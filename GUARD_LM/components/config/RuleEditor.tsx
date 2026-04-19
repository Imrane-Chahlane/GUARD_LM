"use client";

import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { JSON_SCHEMA } from "@/lib/nova/schema";

interface RuleEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export function RuleEditor({ value, onChange }: RuleEditorProps) {
  const { theme } = useTheme();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorWillMount = (monaco: any) => {
    // Configure JSON language defaults with the schema
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: "http://guardlm/rule-schema.json",
          fileMatch: ["*"], // Match all files in this editor
          schema: JSON_SCHEMA,
        },
      ],
    });
  };

  return (
    <div className="border border-line rounded-lg overflow-hidden h-[600px] bg-field">
      <Editor
        height="100%"
        defaultLanguage="json"
        theme={theme === "dark" || theme === "system" ? "vs-dark" : "light"}
        value={value}
        onChange={onChange}
        onMount={(_editor, monaco) => handleEditorWillMount(monaco)}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}
