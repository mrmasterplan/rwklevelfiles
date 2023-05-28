from PIL import Image
from rwklevelfiles.screenshots import Screenshot

class Scene:
    def __init__(self,
                 reference:Screenshot,
                 mask:Screenshot,
                 accept_below:float,
                 bw_threshold = 230,
                 ):
        self.reference = reference
        self.mask = mask
        self.accept_below=accept_below
        self.bw_threshold=bw_threshold

    def error(self, img:Image):
        return Screenshot(img).mask(self.mask).bw(self.bw_threshold).mse(self.reference)

    def match(self, img:Image):
        return self.error(img)<self.accept_below
