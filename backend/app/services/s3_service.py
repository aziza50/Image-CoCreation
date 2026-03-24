'''
Take the urls passed from the frontend and convert them to the correct format for S3
'''
from urllib.parse import urlparse

#def convert_to_s3_format(url: str) -> str: