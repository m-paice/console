import { useState } from "react";
import ANSIToHTML from "ansi-to-html";
import { getWebcontainerInstance } from "./lib/web-container";

import { Editor } from "./components/Editor";

const ANSIConvert = new ANSIToHTML();
const regex = /from\s+["']([^"']+)["']/g;

function App() {
  const [code, setCode] = useState("console.log('testando web container');");
  const [output, setOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const handleRunCode = async () => {
    setOutput([]);
    setRunning(true);

    const dependencies = [];

    let match;
    while ((match = regex.exec(code)) !== null) {
      const conteudoDoFrom = match[1];
      dependencies.push(conteudoDoFrom);
    }

    const files = {
      "index.js": {
        file: {
          contents: code,
        },
      },
      "package.json": {
        file: {
          contents: `
            {
              "name": "example-app",
              "type": "module",
              "dependencies": ${
                dependencies.length > 0
                  ? `{
                ${dependencies.map((item) => `"${item}":"latest"`).join(",")}
              }`
                  : "{}"
              },
              "scripts": {
                "start": "node './' index.js"
              }
            }`,
        },
      },
    };

    setOutput([
      `🔥 Installing all dependencies -> [${dependencies.join(",")}]`,
    ]);

    const instance = await getWebcontainerInstance();
    await instance.mount(files);

    const installProcess = await instance.spawn("npm", ["install"]);
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          setOutput((prevState) => [...prevState, ANSIConvert.toHtml(data)]);
        },
      })
    );
    await installProcess.exit;

    setOutput((prevState) => [...prevState, "🚀 Running code!"]);

    const start = await instance.spawn("npm", ["start"]);
    start.output.pipeTo(
      new WritableStream({
        write(data) {
          setOutput((prevState) => [...prevState, ANSIConvert.toHtml(data)]);
        },
      })
    );
    setRunning(false);
  };

  return (
    <div>
      <main>
        <Editor code={code} setCode={setCode} />
      </main>
      <div className="content">
        <button className="run-code" onClick={handleRunCode}>
          {running ? "Running" : "Run code"}
        </button>
        <div className="code">
          {output.map((item, index) => (
            <p key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
