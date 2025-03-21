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
  ensureFileSync(filename);
  await pipeline(output, fs.createWriteStream(filename));
};

export const processFiles = async (step, deps, prompts) => {
  if (step.indexOf("|") >= 0) {
    const ind = step.split("|")[1];
    const x = deps[ind];
    const second = await normalize(x[0], null);
    const third = path.resolve(x[1] || "");
    const fourth = x[2] ? path.resolve(x[2] || "") : undefined;
    await dance(prompts, second, third, fourth);
  } else {
    for (const x of deps) {
      const second = await normalize(x[0], null);
      const third = path.resolve(x[1] || "");
      const fourth = x[2] ? path.resolve(x[2] || "") : undefined;
      await dance(prompts, second, third, fourth);
    }
  }
}