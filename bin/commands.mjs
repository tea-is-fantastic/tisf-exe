import { execSync } from "child_process";
import Handlebars from "handlebars"

export const processCmds = async (step, cmds, src = {}) => {

  if (step.indexOf("|") >= 0) {
    const cmd = cmds[step.split("|")[1]];
    console.log(cmd);
    const template = Handlebars.compile(cmd);
    const output = template(src);
    execSync(output, { stdio: "inherit" });
  } else {
    for (const cmd of cmds) {
      console.log(cmd);
      const template = Handlebars.compile(cmd);
      const output = template(src);
      execSync(output, { stdio: "inherit" });
    }
  }
}