import sys
import pytesseract
from pytesseract import Output
import PIL.Image
import cv2
import json

myconfig = r"--psm 3 --oem 3"

# Read the file path from command-line arguments
image_path = sys.argv[1]

img = cv2.imread(image_path)
text = pytesseract.image_to_string(PIL.Image.open(image_path), config=myconfig)

print(json.dumps({"text": text}))
