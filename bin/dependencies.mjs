#!/usr/bin/env node

import { normalize } from "./normalize.mjs";
import {execSync } from "child_process";

export const checkdeps = async (config, argv, type, name) => {
  if (!config) {
    return false;
  }
  if (type == "features" || type == "modules") {
    return !!(config?.[type]?.[name])
  }
  const pkg = await normalize(argv.p);
  if(pkg?.dependencies?.[name] || pkg?.devDependencies?.[name]) {
    return true
  }
  return false;
}

export const handledeps = async (dep, argv, config) => {
  const ovr = argv.o;

  const arr = dep.split("|");
  const installed = await checkdeps(config, argv, ...arr);
  if (!installed || ovr) {
    if (arr[0] === "features" || arr[0] == "modules") {
      execSync(`npx @tisf/exe ${arr[1]}`, { stdio: "inherit" });
    } else {
      execSync(`${arr[0]} ${arr[1]}`, { stdio: "inherit" });
    }
  } else {
    console.log("Already installed");
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