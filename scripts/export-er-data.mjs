import {readFileSync} from 'node:fs';
import {buildErData} from './er-data.mjs';

const schema = JSON.parse(readFileSync(new URL('../content/er.json',import.meta.url),'utf8'));
process.stdout.write(JSON.stringify(await buildErData(schema)));
