import fs from 'fs';
import { ensureFileSync } from "fs-extra";
import Handlebars from "handlebars";
import path from "path";
import stream from 'stream';
import util from 'util';
import { normalize } from "./normalize.mjs";

const pipeline = util.promisify(stream.pipeline);

const dance = async (src, dst, pth, fil) => {
  if (fil) {
    src = await normalize(fil)
  }
  const template = Handlebars.compile(dst);
  const output = template(src);
  const filename = path.resolve(pth);
  console.log(filename);
  ensureFileSync(filename);
  await pipeline(output, fs.createWriteStream(filename));
};

export const handleFilename = async (x) => {
  const second = await normalize(x[0], null);
  let isdir;
  //TODO directory handling
  // const isdir = !path.extname(x[0]);
  let third = path.resolve(x[1] || "");
  try {
    isdir = fs.lstatSync(third).isDirectory();
  } catch (e) {
    isdir = false;
  }
  if(isdir) {
    third = path.resolve(path.basename(x[0]));
  }
  // const third = path.resolve(x[1] || filename);
  const fourth = x[2] ? path.resolve(x[2] || "") : undefined;
  return [second, third, fourth];
}

export const processFiles = async (step, deps, prompts) => {
  if (step.indexOf("|") >= 0) {
    const ind = step.split("|")[1];
    const x = deps[ind];
    const args = await handleFilename(x);
    await dance(prompts, ...args);
  } else {
    for (const x of deps) {
      const args = await handleFilename(x);
      await dance(prompts, ...args);
    }
  }
}