import tkinter as tk

from rwklevelfiles.rwkpage import RwkPage


class MyGUI:
    rwk:RwkPage
    def __init__(self, root):
        self.root = root
        root.title("Button GUI")

        self.start_button = tk.Button(root, text="Start", command=self.start)
        self.start_button.pack()

        self.extract_button = tk.Button(root, text="Extract", command=self.extract)

        self.extract_button.pack()

        self.inject_button = tk.Button(root, text="Inject", command=self.inject)

        self.inject_button.pack()

        self.close_button = tk.Button(root, text="Close", command=self.close)

        self.close_button.pack()

        self.rwk = None
        self.diable_all()

    def diable_all(self):
        self.extract_button["state"] = "disabled"
        self.close_button["state"] = "disabled"
        self.inject_button["state"] = "disabled"
    def enable_all(self):
        self.extract_button["state"] = "normal"
        self.close_button["state"] = "normal"
        self.inject_button["state"] = "normal"

    def start(self):
        print("Start")
        self.rwk = RwkPage(headless=False)
        self.rwk.open()
        self.rwk.wait_for_load()
        self.rwk.click(*self.rwk.COORD_WASD)
        self.enable_all()

    def close(self):
        self.rwk.close()
        self.diable_all()
        exit()

    def extract(self):
        print("Extract")
        print(self.rwk.getKey("/RAPTISOFT_SANDBOX/RWK/settings.txt").decode('utf-8'))

    def inject(self):
        print("Inject")
    def close(self):
        self.rwk.close()


def run_gui():
    root = tk.Tk()
    my_gui = MyGUI(root)
    root.mainloop()
