#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { processCmds } from './commands.mjs'
import { processDeps, savedeps } from './dependencies.mjs'
import { processFiles } from './files.mjs'
import { inquire } from './inquire.mjs'
import { normalize } from './normalize.mjs'
import { processRegex } from './regex.mjs'
import { saveconf } from './saveconf.mjs'
import { processScripts } from './scripts.mjs'

const argv = yargs(hideBin(process.argv))
  .usage('Usage: npx @tisf/install <src> [options]')
  .command('$0 <src>', 't', (yargs) => {
    yargs.positional('src', {
      describe: 'Url or path of data',
      type: 'string'
    })
  })
  .options({
    c: {
      default: 'tisf.json',
      describe: 'Tisf config',
      type: 'string'
    },
    p: {
      default: 'package.json',
      describe: 'Package.json',
      type: 'string'
    },
    r: {
      default: 0,
      describe: 'Resume',
      type: 'number'
    },
    s: {
      describe: 'silent no prompt (default: false)',
      type: 'boolean'
    },
    o: {
      describe: 'Overwrite (default: false)',
      type: 'boolean'
    }
  })
  .help('h')
  .demandCommand(1)
  .parse();


(async () => {

  const burl = argv.src;

  const src = await normalize("/config.json", undefined, burl);
  const config = await normalize(argv.c);
  const silent = argv.s;
  const ovr = argv.o;
  const res = argv.r;
  const nam = src.name;
  const typ = src.type;

  const installed = !!(config?.[typ]?.[nam]?.installed);
  
  if(!ovr && installed) {
    console.log("Already installed");
    return;
  }

  let prompts, obj, saved;

  if(silent) {
    obj = config?.[typ]?.[nam];
  }

  src.steps.splice(0, res);

  for (let i=0; i < src.steps.length; i++) {
    const step = src.steps[i];
    if(!saved && !silent && prompts) {
      await saveconf(prompts, argv.c, config, typ, nam);
      saved = true;
    }
    console.log(`=======${i}=======`, step);
    if (step === "prompts" && !silent) {
      prompts = await inquire(src.prompts);
    } else if (step.indexOf("deps") === 0) {
      await processDeps(step, src.deps, argv, config);
    } else if (step.indexOf("cmds") === 0) {
      await processCmds(step, src.cmds, silent ? obj : prompts);
    } else if (step.indexOf("files") === 0) {
      await processFiles(step, src.files, silent ? obj : prompts);
    } else if (step.indexOf("scripts") === 0) {
      await processScripts(step, src.scripts, silent ? obj : prompts);
    } else if (step.indexOf("regex") === 0) {
      await processRegex(step, src.regex, silent ? obj : prompts);
    }
  }

  await savedeps(config, argv, typ, nam);

})();
