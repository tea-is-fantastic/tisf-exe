#!/usr/bin/env node

import fs from 'fs'
import merge from 'lodash/merge.js'
import path from 'path'
import { normalize } from './normalize.mjs'

export function expandVariant(variant, value) {
  if (variant === "root") return value;
  return variant.split('.').reverse().reduce((acc, key) => ({ [key]: acc }), value);
}

export const saveconf = async (src, sav, tconf, typ, nam) => {
  let mrg = {
    [typ]: {
      [nam]: src
    }
  }
  if (typ === "root") {
    mrg = src
  }
  const fconf = merge(tconf, mrg);
  fs.writeFileSync(path.resolve(sav), JSON.stringify(fconf));
  return fconf;
}