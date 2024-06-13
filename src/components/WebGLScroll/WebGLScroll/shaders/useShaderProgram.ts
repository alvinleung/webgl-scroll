import { useEffect, useState } from "react";
import ShaderProgram from "./ShaderProgram";

export function useShaderProgram(vertexShader: string, fragmentShader: string) {
  const [shaderProgram, setShaderProgram] = useState<
    ShaderProgram | undefined
  >();

  useEffect(() => {
    // eslint-disable-next-line local-rules/enforce-call-cleanup
    const program = new ShaderProgram(vertexShader, fragmentShader);
    setShaderProgram(program);

    return () => {
      program.cleanup();
    };
  }, [vertexShader, fragmentShader]);

  return shaderProgram;
}
