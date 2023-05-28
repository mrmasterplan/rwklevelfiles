import importlib.resources
import os.path
from typing import List

import platformdirs

import rwklevelfiles


class Resources:
    def __init__(self, data_dir:str = None):
        self.data_dir = data_dir or platformdirs.user_data_dir('rwklevelfiles',
                                                               'rwklevelfiles')

    def pathof(self, filename:str,folders:List[str]=None):
        folders = folders or []
        return os.path.join(self.data_dir,*folders,filename)

    def config(self):
        return self.pathof('config.yml')

    @classmethod
    def builtin(cls, name:str):
        with importlib.resources.open_binary(
                rwklevelfiles, name
        ) as resource_file:
            return resource_file.read()
