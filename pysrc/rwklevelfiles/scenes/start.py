
from rwklevelfiles.scenes.Scene import Scene
from rwklevelfiles.screenshots import Screenshot
start_scene = Scene(
reference = Screenshot.fromResource("start.png"),
    mask = Screenshot.fromResource('start_mask.png'),
    accept_below = 2000
)