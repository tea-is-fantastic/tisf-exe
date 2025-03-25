#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { normalize } from "./normalize.mjs";

export const savedeps = async (config, argv, type, name) => {
  if (type == "features" || type == "modules") {
    const tconf = await normalize(argv.c);
    if (tconf?.[type]?.[name]) {
      tconf[type][name].installed = true;
    } else {
      tconf[type][name] = { installed: true };
    }
    fs.writeFileSync(path.resolve(argv.c), JSON.stringify(tconf));
  }
}

export const checkdeps = async (config, argv, type, pkgs) => {
  const ovr = argv.o;
  const output = [];
  if (!config || ovr) {
    return pkgs;
  }
  if (type === "features" || type === "modules") {
    for (const pkg of pkgs) {
      if (!config?.[type]?.[pkg]?.installed) {
        output.push(pkg);
      }
    }
  }
  const pkjs = await normalize(argv.p);
  for (const pkg of pkgs) {
    if (!pkjs?.dependencies?.[pkg] && !pkjs?.devDependencies?.[pkg]) {
      output.push(pkg);
    }
  }

  return output;
}

export const installcmd = (cmd, sil) => {
  if (cmd === "features" || cmd === "modules") {
    return "npx @tisf/exe" + sil
  } else if (cmd === "npm") {
    return "npm install"
  } else if (cmd === "dev") {
    return "npm install -D"
  } else if (cmd === "expo") {
    return "npx expo install"
  } else {
    return cmd
  }
}

export const handledeps = async (dep, argv, config) => {
  const sil = argv.s ? " -s" : "";
  const arr = dep.split("|");
  const pkgs = arr[1].split(" ");
  const cmd = installcmd(arr[0], sil);
  const installed = await checkdeps(config, argv, arr[0], pkgs);
  for (const pkg of installed) {
    execSync(`${cmd} ${pkg}`, { stdio: "inherit" });
  }
}

export const processDeps = async (step, deps, argv, config) => {
  if (step.indexOf("|") >= 0) {
    const ind = step.split("|")[1];
    await handledeps(deps[ind], argv, config);
  } else {
    for (const dep of deps) {
      await handledeps(dep, argv, config);
    }
  }
}