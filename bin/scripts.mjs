import { execFileSync, execSync } from 'child_process';
import fs from 'fs';
import { ensureDirSync } from 'fs-extra';
import Handlebars from "handlebars";
import path from 'path';
import { v4 } from 'uuid';
import { normalize } from "./normalize.mjs";


export const handleScript = async (cmd, src = {}) => {
  const dirname = path.resolve(v4());
  ensureDirSync(dirname);

  const url = cmd[0];
  const args = JSON.stringify(cmd[1]) || "{}";

  const pkg = await normalize("/package.json", null, url);
  const scr = await normalize("/index.js", null, url);
  const tpkg = Handlebars.compile(pkg);
  const tscr = Handlebars.compile(scr);
  const targ = Handlebars.compile(args);
  const opkg = tpkg(src);
  const oscr = tscr(src);
  const oarg = targ(src);

  fs.writeFileSync(path.resolve(dirname, "package.json"), opkg);
  fs.writeFileSync(path.resolve(dirname, "index.js"), oscr);

  execSync("npm i", {
    stdio: "inherit",
    cwd: dirname
  })

  execFileSync("node", ["index.js", oarg], {
    stdio: "inherit",
    cwd: dirname,
    encoding: "utf-8"
  })

  fs.rmSync(dirname, { recursive: true, force: true });

  console.log('Project setup complete.');
}

export const processScripts = async (step, cmds, src = {}) => {

  if (step.indexOf("|") >= 0) {
    const cmd = cmds[step.split("|")[1]];
    console.log(cmd);
    await handleScript(cmd, src);
  } else {
    for (const cmd of cmds) {
      console.log(cmd);
      await handleScript(cmd, src);
    }
  }
}