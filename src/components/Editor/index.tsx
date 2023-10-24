import CodeEditor from "@uiw/react-textarea-code-editor";

interface Props {
  code: string;
  setCode(code: string): void;
}

export function Editor({ code, setCode }: Props) {
  return (
    <CodeEditor
      value={code}
      language="js"
      placeholder="Please enter JS code."
      onChange={(evn) => setCode(evn.target.value)}
      padding={15}
      rows={10}
      style={{
        width: "100%",
        fontSize: 12,
        backgroundColor: "#051923",
        fontFamily:
          "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
      }}
    />
  );
}
