import time

from rwklevelfiles import RwkPage

from rwklevelfiles.gui import run_gui


def main():
    run_gui()


def main2():
    rwk = RwkPage(headless=False)
    rwk.open()
    rwk.wait_for_load()
    rwk.click(*rwk.COORD_WASD)
    rwk.screenshot().save('afterclick.png')
    time.sleep(1)
    rwk.screenshot().save('afterclick2.png')
    print(rwk.getKey("/RAPTISOFT_SANDBOX/RWK/settings.txt").decode('utf-8'))
