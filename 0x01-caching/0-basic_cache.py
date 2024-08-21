#!/usr/bin/python3
""" Module documentation """

from base_caching import BaseCaching
class BasicCache(BaseCaching):
    """ BasicCache class that inherits from BaseCaching """
    def put(self, key, item):
        """ func documenation """
        if key is not None and item is not None:
            self.cache_data[key] = item
    def get(self, key):
        """ Get an item by key """
        if key is None:
            return None
        return self.cache_data.get(key, None)
