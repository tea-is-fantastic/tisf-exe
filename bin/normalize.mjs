#!/usr/bin/env node

import axios from "axios"
import fs from 'fs'
import path from 'path'

export const parseUrl = (url, burl) => {
  let nurl, pth, typ;
  if (burl && url.indexOf("/") === 0) {
    url = burl + url;
  }
  if (url.indexOf("http") === 0) {
    nurl = url;
    typ = "url";
  } else if (url.indexOf("@") === 0) {
    const cmp = url.substring(1).split("/");
    typ = cmp[1];
    cmp.splice(1, 0, "main");
    nurl = `https://raw.githubusercontent.com/t-i-f/` + cmp.join("/");
  } else {
    pth = url
    typ = "path";
  }
  return { nurl, pth, typ }
}

export const normalize = async (url, fun = JSON.parse, baseurl) => {
  let output;
  // if (url.indexOf("http") === 0) {
  //   nurl = url;
  // } else if (url.indexOf("@") === 0) {
  //   const cmp = url.substring(1).split("/");
  //   cmp.splice(1, 0, "main");
  //   console.log();
  //   nurl = `https://raw.githubusercontent.com/t-i-f/` + cmp.join("/");
  // } else {
  //   pth = url
  // }

  const { nurl, pth } = parseUrl(url, baseurl);

  if (nurl) {
    try {
      console.log(nurl);
      const response = await axios.get(nurl, {
        responseType: fun ? "json" : "text", headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      return response.data; // JSON data as JS object
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else {
    try {
      output = fs.readFileSync(path.resolve(pth), { encoding: "utf-8" });
    } catch (err) {
      output = "{}";
    }
    return fun ? fun(output) : output;
  }
}