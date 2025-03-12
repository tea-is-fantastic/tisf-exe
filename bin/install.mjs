#!/usr/bin/env node

import Handlebars from "handlebars";
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { execSync } from 'child_process';
import { normalize } from './normalize.mjs';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: npx @tisf/exe <repo> [options]')
  .command('$0 <repo>', 't', (yargs) => {
    yargs.positional('repo', {
      describe: 'Github Repository',
      type: 'string'
    })
  })
  .options({
    c: {
      default: 'tisf.json',
      describe: 'Load Tisf config',
      type: 'string'
    },
    t: {
      default: 'installed',
      describe: 'Tisf group (default: installed)',
      type: 'string'
    },
    n: {
      describe: 'Tisf name',
      type: 'string'
    }
  })
  .help('h')
  .demandCommand(1)
  .parse();

(async () => {

  const con = argv.c;
  const typ = argv.t;
  const nam = argv.n;
  let repo, config, src;

  if (con && typ && nam) {
    repo = await normalize(argv.repo, null);
    config = await normalize(con);
    const template = Handlebars.compile(repo);
    if (typ === "root") {
      if (nam) {
        src = config?.[nam] || {};
      }
    } else {
      src = config?.[typ]?.[nam] || {};
    }
    const output = template(src);
    repo = JSON.parse(output);
  } else {
    repo = await normalize(argv.repo)
  }

  for (const x of repo.commands) {
    console.log(x);
    execSync(x, { stdio: "inherit" });
  }

  console.log('Project setup complete.');


})();
