import time
from collections import namedtuple

import numpy
import seleniumwire
from PIL.Image import Resampling
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from seleniumwire import webdriver
from seleniumwire.request import Request, Response
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from PIL import Image
import io
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

Coords = namedtuple("Coords", "x,y")
Color = namedtuple("Color", "r,g,b,a")


class RwkPage:
    driver: seleniumwire.webdriver.Chrome
    convas: WebElement
    # CONSTANTS
    COORD_NEWS_LETTER = Coords(100, 100)
    COORD_CONTROLS_SELECTOR = Coords(146, 295)
    COORD_WASD = Coords(500,200)


    def screenshot(self)->Image:
        ideal_size = (736,414)
        img= Image.open(io.BytesIO(self.canvas.screenshot_as_png))
        if img.size != ideal_size:
            print("Resizing image from", img.size)
            img = img.resize(ideal_size, Resampling.BICUBIC)
        return img

    def simple_screenshot(self):
        numpy.asarray(self.screenshot())

    def __init__(self, headless=True):
        self.canvas = None
        self.headless = headless
        self.open()
        self.log = open('log.txt',"w")

    def open(self):
        chrome_options = webdriver.ChromeOptions()
        if self.headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--window-size=1920,1080")
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, chrome_options=chrome_options)

        def request_interceptor(request: Request):
            # Block the scripts that make ads appear on the page
            path = request.path
            # print("Request coming from", path)
            if path.endswith(("/adsbygoogle.js", "/tag.min.js")):
                print("Request coming from...blocked")
                request.abort()

        def response_interceptor(request: Request, response: Response):
            # will be needed to get level statistics
            print("got response from",request.path)
            if request.path == "/go.php":
                header = "::RMLResponseFollows::"
                try:
                    body = response.body.decode('utf-8')
                except:
                    return
                self.log.write("New response:\n")
                self.log.write(body)

                if body.startswith(header):
                    body = body[len(header):]
                body = body.replace('[','<').replace(']','>')
                body = f"<root>{body}</root>"
                # print(body)

        self.driver.request_interceptor = request_interceptor
        self.driver.response_interceptor = response_interceptor

        # get is blocking until page is loaded
        self.driver.get("https://robotwantskitty.com/web/")

        self.driver.execute_script(idb_init_script)
        self.canvas = self.driver.find_element(By.ID, "canvas")

    def close(self):
        self.log.flush()
        self.log.close()
        self.driver.close()

    def wait_for_load(self):
        """Waits for either the controls selector or intro screen to show."""
        i = 0
        while True:
            i += 1
            time.sleep(1)

            img=self.screenshot()

            c = Color(*(img.getpixel(self.COORD_CONTROLS_SELECTOR)))
            img.save(f"iter{i}_{c.r}_{c.g}_{c.b}.png")

            if (c.r < 220) or (c.g < 220) or (c.b < 220):
                print(f"iteration {i} too dark", c)
                continue

            print(f"iteration {i} pass", c)
            # img.show()
            break

    def click(self, x, y):
        # doc = driver.find_element(By.TAG_NAME,'html')
        rect = self.canvas.rect
        # loc_x = rect['x']
        # loc_y = rect['y']
        w2 = rect["width"] / 2
        h2 = rect["height"] / 2

        (
            ActionChains(self.driver)
            .move_to_element_with_offset(self.canvas, x - w2, y - h2)
            .click()
            .perform()
        )

    def getAllKeys(self):
        keys = self.driver.execute_async_script("""
            var done = arguments[0];
            let db;
            db = await idb.openDB("/RAPTISOFT_SANDBOX");
            done( await db.getAllKeys("FILE_DATA"));
        """)
        return keys

    def getKey(self, key: str):
        data = self.driver.execute_async_script(f"""
            var done = arguments[0];
            let db;
            db = await idb.openDB("/RAPTISOFT_SANDBOX");

            const obj= await db.get("FILE_DATA", "{key}");
            obj.timestamp= +obj.timestamp
            done(obj.contents);
        """)
        return bytes(data)

    def inject_db(self):
        pass

    def extract_db(self):
        pass

    def __del__(self):
        try:
            self.driver.close()
        except:  #noqa
            pass

# The following is a complete copy of the nodejs package idb
# from https://cdn.jsdelivr.net/npm/idb@7/build/umd.js
# It allows me to use a much simple inteface to the indexedDB
idb_init_script = (
    """!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports)"""
    """:"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!"""
    """=typeof globalThis?globalThis:e||self).idb={})}(this,(function(e){"use stric"""
    """t";let t,n;const r=new WeakMap,o=new WeakMap,s=new WeakMap,i=new WeakMap,a=new"""
    """ WeakMap;let c={get(e,t,n){if(e instanceof IDBTransaction){if("done"===t)retur"""
    """n o.get(e);if("objectStoreNames"===t)return e.objectStoreNames||s.get(e);if("s"""
    """tore"===t)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreName"""
    """s[0])}return f(e[t])},set:(e,t,n)=>(e[t]=n,!0),has:(e,t)=>e instanceof IDBTran"""
    """saction&&("done"===t||"store"===t)||t in e};function d(e){return e!==IDBDataba"""
    """se.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(n||(n"""
    """=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype"""
    """.continuePrimaryKey])).includes(e)?function(...t){return e.apply(p(this),t),f("""
    """r.get(this))}:function(...t){return f(e.apply(p(this),t))}:function(t,...n){co"""
    """nst r=e.call(p(this),t,...n);return s.set(r,t.sort?t.sort():[t]),f(r)}}functio"""
    """n u(e){return"function"==typeof e?d(e):(e instanceof IDBTransaction&&function("""
    """e){if(o.has(e))return;const t=new Promise(((t,n)=>{const r=()=>{e.removeEventL"""
    """istener("complete",o),e.removeEventListener("error",s),e.removeEventListener"""
    """("abort",s)},o=()=>{t(),r()},s=()=>{n(e.error||new DOMException("AbortErro"""
    """r","AbortError")),r()};e.addEventListener("complete",o),e.addEventListener("er"""
    """ror",s),e.addEventListener("abort",s)}));o.set(e,t)}(e),n=e,(t||(t=[IDBDatabas"""
    """e,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some((e=>n instanceof e)"""
    """)?new Proxy(e,c):e);var n}function f(e){if(e instanceof IDBRequest)return func"""
    """tion(e){const t=new Promise(((t,n)=>{const r=()=>{e.removeEventListener("succe"""
    """ss",o),e.removeEventListener("error",s)},o=()=>{t(f(e.result)),r()},s=()=>{n(e"""
    """.error),r()};e.addEventListener("success",o),e.addEventListener("error",s)}));"""
    """return t.then((t=>{t instanceof IDBCursor&&r.set(t,e)})).catch((()=>{})),a.set"""
    """(t,e),t}(e);if(i.has(e))return i.get(e);const t=u(e);return t!==e&&(i.set(e,t)"""
    """,a.set(t,e)),t}const p=e=>a.get(e);const l=["get","getKey","getAll","getAllKey"""
    """s","count"],D=["put","add","delete","clear"],b=new Map;function v(e,t){if(!(e """
    """instanceof IDBDatabase)||t in e||"string"!=typeof t)return;if(b.get(t))return """
    """b.get(t);const n=t.replace(/FromIndex$/,""),r=t!==n,o=D.includes(n);if(!(n in("""
    """r?IDBIndex:IDBObjectStore).prototype)||!o&&!l.includes(n))return;const s=async"""
    """ function(e,...t){const s=this.transaction(e,o?"readwrite":"readonly");let i=s"""
    """.store;return r&&(i=i.index(t.shift())),(await Promise.all([i[n](...t),o&&s.do"""
    """ne]))[0]};return b.set(t,s),s}c=(e=>({...e,get:(t,n,r)=>v(t,n)||e.get(t,n,r),h"""
    """as:(t,n)=>!!v(t,n)||e.has(t,n)}))(c),e.deleteDB=function(e,{blocked:t}={}){con"""
    """st n=indexedDB.deleteDatabase(e);return t&&n.addEventListener("blocked",(()=>t"""
    """())),f(n).then((()=>{}))},e.openDB=function(e,t,{blocked:n,upgrade:r,blocking:"""
    """o,terminated:s}={}){const i=indexedDB.open(e,t),a=f(i);return r&&i.addEventLis"""
    """tener("upgradeneeded",(e=>{r(f(i.result),e.oldVersion,e.newVersion,f(i.transac"""
    """tion))})),n&&i.addEventListener("blocked",(()=>n())),a.then((e=>{s&&e.addEvent"""
    """Listener("close",(()=>s())),o&&e.addEventListener("versionchange",(()=>o()))})"""
    """).catch((()=>{})),a},e.unwrap=p,e.wrap=f}));"""
)
