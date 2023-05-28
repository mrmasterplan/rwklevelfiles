import io
from typing import Self

import cv2
import numpy
from PIL import Image
import importlib.resources

import rwklevelfiles


class Screenshot:
    def __init__(self, img:Image):
        self.img = img
    @classmethod
    def fromPngBytes(cls, data):
        return cls(Image.open(io.BytesIO(data)))

    def getPngBytes(self):
        img_byte_arr = io.BytesIO()
        self.img.save(img_byte_arr, format='PNG')
        return img_byte_arr.getvalue()

    @classmethod
    def fromResource(cls, name:str):
        with importlib.resources.open_binary(
                rwklevelfiles, name
        ) as resource_file:
            return cls.fromPngBytes(resource_file.read())

    def mask(self, other:Self):
        assert self.img.size == other.img.size
        grayscale_image = self.img.convert("L")
        grayscale_mask = other.img.convert("L")
        output_image = Image.new("L", grayscale_image.size)
        output_image.paste(grayscale_image, (0, 0), mask=grayscale_mask)
        return Screenshot(output_image)

# Screenshot(r.screenshot()).mask(m).mse(sm)
# m=Screenshot.fromResource('start_mask.png')
    def bw(self, threshold=230):
        lut = [255*int(i>threshold) for i in range(256)]
        return Screenshot(self.img.convert("L").point(lut))

    def prepare_for_comp(self):
        grayscale_image = self.img.convert("L")
        return numpy.array(grayscale_image)
        # return cv2.cvtColor(cimg, cv2.COLOR_BGR2GRAY)

    def mse(self, other:Self):
        img1 = self.prepare_for_comp()
        img2 = other.prepare_for_comp()
        h, w = img1.shape
        diff = cv2.subtract(img1, img2)
        err = numpy.sum(diff ** 2)
        return err
        # mse = err / (float(h * w))
        # return mse