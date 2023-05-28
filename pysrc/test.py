import time
from PIL import Image
import io

from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
# from selenium import webdriver
from seleniumwire import webdriver
# from selenium.webdriver.common.keys import Keys
# from selenium.webdriver.common.by import By
# from selenium.webdriver.firefox.options import Options

# from selenium.webdriver.firefox.service import Service
# from webdriver_manager.firefox import GeckoDriverManager
# driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()))
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--window-size=1920,1080" )
# chrome_options.add_argument("--window-size=736,414" )
# chrome_options.binary_location = CHROME_PATH
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()),chrome_options=chrome_options)

from seleniumwire.request import Request
def interceptor(request:Request):
    # Block PNG, JPEG and GIF images
    path = request.path
    print("Request coming from",path)
    if path.endswith(('/adsbygoogle.js','/tag.min.js')):
        print("...blocked")
        request.abort()

driver.request_interceptor = interceptor

driver.get("https://robotwantskitty.com/web/")
driver.execute_script('''!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).idb={})}(this,(function(e){"use strict";let t,n;const r=new WeakMap,o=new WeakMap,s=new WeakMap,i=new WeakMap,a=new WeakMap;let c={get(e,t,n){if(e instanceof IDBTransaction){if("done"===t)return o.get(e);if("objectStoreNames"===t)return e.objectStoreNames||s.get(e);if("store"===t)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return f(e[t])},set:(e,t,n)=>(e[t]=n,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function d(e){return e!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(n||(n=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(e)?function(...t){return e.apply(p(this),t),f(r.get(this))}:function(...t){return f(e.apply(p(this),t))}:function(t,...n){const r=e.call(p(this),t,...n);return s.set(r,t.sort?t.sort():[t]),f(r)}}function u(e){return"function"==typeof e?d(e):(e instanceof IDBTransaction&&function(e){if(o.has(e))return;const t=new Promise(((t,n)=>{const r=()=>{e.removeEventListener("complete",o),e.removeEventListener("error",s),e.removeEventListener("abort",s)},o=()=>{t(),r()},s=()=>{n(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",o),e.addEventListener("error",s),e.addEventListener("abort",s)}));o.set(e,t)}(e),n=e,(t||(t=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some((e=>n instanceof e))?new Proxy(e,c):e);var n}function f(e){if(e instanceof IDBRequest)return function(e){const t=new Promise(((t,n)=>{const r=()=>{e.removeEventListener("success",o),e.removeEventListener("error",s)},o=()=>{t(f(e.result)),r()},s=()=>{n(e.error),r()};e.addEventListener("success",o),e.addEventListener("error",s)}));return t.then((t=>{t instanceof IDBCursor&&r.set(t,e)})).catch((()=>{})),a.set(t,e),t}(e);if(i.has(e))return i.get(e);const t=u(e);return t!==e&&(i.set(e,t),a.set(t,e)),t}const p=e=>a.get(e);const l=["get","getKey","getAll","getAllKeys","count"],D=["put","add","delete","clear"],b=new Map;function v(e,t){if(!(e instanceof IDBDatabase)||t in e||"string"!=typeof t)return;if(b.get(t))return b.get(t);const n=t.replace(/FromIndex$/,""),r=t!==n,o=D.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!o&&!l.includes(n))return;const s=async function(e,...t){const s=this.transaction(e,o?"readwrite":"readonly");let i=s.store;return r&&(i=i.index(t.shift())),(await Promise.all([i[n](...t),o&&s.done]))[0]};return b.set(t,s),s}c=(e=>({...e,get:(t,n,r)=>v(t,n)||e.get(t,n,r),has:(t,n)=>!!v(t,n)||e.has(t,n)}))(c),e.deleteDB=function(e,{blocked:t}={}){const n=indexedDB.deleteDatabase(e);return t&&n.addEventListener("blocked",(()=>t())),f(n).then((()=>{}))},e.openDB=function(e,t,{blocked:n,upgrade:r,blocking:o,terminated:s}={}){const i=indexedDB.open(e,t),a=f(i);return r&&i.addEventListener("upgradeneeded",(e=>{r(f(i.result),e.oldVersion,e.newVersion,f(i.transaction))})),n&&i.addEventListener("blocked",(()=>n())),a.then((e=>{s&&e.addEventListener("close",(()=>s())),o&&e.addEventListener("versionchange",(()=>o()))})).catch((()=>{})),a},e.unwrap=p,e.wrap=f}));''')
time.sleep(1)
canvas: WebElement= driver.find_element(By.ID, "canvas")

# input("done?")
# driver.get_screenshot_as_file('out.png')
for i in range(20):
    time.sleep(1)
    canvas: WebElement = driver.find_element(By.ID, "canvas")

    img = Image.open(io.BytesIO(canvas.screenshot_as_png))

    r,g,b,a = img.getpixel((146,295))
    img.save(f'iter{i}_{r}_{g}_{b}.png')

    if (r<220) or (g<220 )or (b<220):
        print(f"iteration {i} too dark, {r}_{g}_{b}")
        continue

    print(f"iteration {i} pass, {r}_{g}_{b}")
    # img.show()
    break
# else:
#     exit(-1)

# canvas.rect
# {'height': 471, 'width': 838, 'x': 351.0500183105469, 'y': 25}
# canvas.location
# {'x': 351, 'y': 25}
def click(x,y):
    # doc = driver.find_element(By.TAG_NAME,'html')
    rect = canvas.rect
    # loc_x = rect['x']
    # loc_y = rect['y']
    width=rect['width']
    height=rect['height']

    (
        ActionChains(driver)
        .move_to_element_with_offset(canvas, -(width/2) + x, -(height/2) + y)
        .click()
        .perform()
    )
    # ActionChains(driver).move_by_offset(loc_x+(3*width/4), loc_y+(height/2)).click()
click(500,200)
time.sleep(1)
img = Image.open(io.BytesIO (driver.get_screenshot_as_png())).crop((322,25,1598,743))
# img.show()
img.save(f'afterclick.png')
# input("done?")
# driver.close()


#
# # read keys from indexed db
# keys =driver.execute_async_script("""
# var done = arguments[0];
# let db;
# db = await idb.openDB("/RAPTISOFT_SANDBOX");
# done( await db.getAllKeys("FILE_DATA"));
# """)
# print(keys)
#
# # read data from indexeddb
# data =driver.execute_async_script("""
# var done = arguments[0];
# let db;
# db = await idb.openDB("/RAPTISOFT_SANDBOX");
#
# const obj= await db.get("FILE_DATA", "/RAPTISOFT_SANDBOX/RWK/settings.txt");
# obj.timestamp= +obj.timestamp
# //# if(typeof obj.contents != "undefined"){
# //#     done("empty");
# //#     //obj.content_type = (obj.contents.constructor === Uint8Array)?"Uint8Array":"Int8Array";
# //#     //obj.contents = buf2hex(obj.contents);
# //# }else{
# done(obj.contents);
# //}
# //            return obj;
# //done( await db.getAllKeys("FILE_DATA"));
# """)
# print("".join(chr(i) for i in data))
#
#
# # """
# #  var done = arguments[0];
# # const request = indexedDB.open("/RAPTISOFT_SANDBOX");
# # request.onerror = (event) => {
# #   console.error("Why didn't you allow my web app to use IndexedDB?!");
# #   done("error")
# # };
# # request.onsuccess = (event) => {
# #   db = event.target.result;
# #   done(db)
# # };
# # """)
#
driver.close()
#
