from rwklevelfiles.screenshots import Screenshot
# m=Screenshot.fromResource('start_mask.png')
# s=Screenshot.fromResource('start.png')
# sm = s.mask(m).bw()
from rwklevelfiles.scenes.start import start_scene
import rwklevelfiles
r = rwklevelfiles.rwkpage.RwkPage(headless=False)
start_scene.error(r.screenshot())
# Screenshot(r.screenshot()).mask(m).bw().mse(sm)

