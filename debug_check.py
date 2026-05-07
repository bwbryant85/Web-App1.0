import re
from pathlib import Path
core = Path('js/core.js').read_text()
games = Path('js/apps/games98.js').read_text()
ids_games = re.findall(r"\{\s*id:'([a-z0-9_]+)'", games)
app_init_block = re.search(r'const APP_INIT = \{([\s\S]*?)\};', core)
keys = re.findall(r"([a-z0-9_]+):\s*\(\) =>", app_init_block.group(1)) if app_init_block else []
hidden = re.search(r'const HIDDEN_APPS = \[([\s\S]*?)\];', core)
hidden_ids = re.findall(r"\{\s*id:'([a-z0-9_]+)'", hidden.group(1)) if hidden else []
page_ids = re.findall(r"\{\s*id:'([a-z0-9_]+)'", core.split('const HIDDEN_APPS')[0])
print('games ids:', ids_games)
print('APP_INIT keys missing for games:', [i for i in ids_games if i not in keys])
print('hidden ids:', hidden_ids)
print('page ids includes games ids:', all(i in page_ids or i in hidden_ids for i in ids_games))
print('missing in lookup:', [i for i in ids_games if i not in page_ids and i not in hidden_ids])
