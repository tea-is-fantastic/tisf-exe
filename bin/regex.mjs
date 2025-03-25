import fs from 'fs';
import Handlebars from "handlebars";
import path from 'path';
import regexpTree from "regexp-tree";
import { replaceInFile } from "replace-in-file";
import YAML from "yaml";
import { normalize } from "./normalize.mjs";


async function regex(files, re, rep, already, callback) {
  try {
    const filecont = await fs.promises.readFile(files, 'utf-8');
    if (already && filecont.includes(already)) {
      return;
    }

    const reg = regexpTree.toRegExp(re);
    let to = rep;

    if (callback) {
      to = input => callback(input.replace(reg, rep));
    }

    const results = await replaceInFile({
      files,
      from: reg,
      to,
    });

    console.log('Replacement results:', results);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

export const handleRegex = async (url, src = {}) => {
  const yml = await normalize(url, null);
  console.log(yml)
  const template = Handlebars.compile(yml);
  const output = template(src);

  const yaml = YAML.parse(output);
  const pth = path.resolve(...yaml.path);

  for (const a of yaml.data) {
    console.log(a);
    await regex(
      pth,
      a.find && a.find.trim(),
      a.replace && a.replace.trim(),
      a.already && a.already.trim()
    );
  }

  console.log('Project setup complete.');
}

export const processRegex = async (step, cmds, src = {}) => {

  if (step.indexOf("|") >= 0) {
    const cmd = cmds[step.split("|")[1]];
    console.log(cmd);
    await handleRegex(cmd, src);
  } else {
    for (const cmd of cmds) {
      console.log(cmd);
      await handleRegex(cmd, src);
    }
  }
}