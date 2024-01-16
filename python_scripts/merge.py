import sys
import pytesseract
from pytesseract import Output
import PIL.Image
import cv2
import json
from difflib import SequenceMatcher

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def find_most_similar_sections(complaint, sections, top_n=6):
    similarities = []

    for section in sections:
        similarity = similar(complaint, section["Offense"])
        similarities.append((section, similarity))

    # Sort sections based on similarity in descending order
    sorted_sections = sorted(similarities, key=lambda x: x[1], reverse=True)

    return sorted_sections[:top_n]

def ocr(image_path):
    myconfig = r"--psm 3 --oem 3"
    img = cv2.imread(image_path)
    extracted_text = pytesseract.image_to_string(PIL.Image.open(image_path), config=myconfig)
    print("Extracted Text:")
    print(extracted_text)

    return extracted_text

def main():
    if len(sys.argv) < 2:
        print("Usage: python merge.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    extracted_text = ocr(image_path)

    if not extracted_text:
        print("No relevant text extracted.")
        return

    with open("csvjson.json", "r", encoding="utf-8") as file:
        section_data = json.load(file)

    # Original Code
    most_similar_sections_original = find_most_similar_sections(extracted_text, section_data)

    if most_similar_sections_original:
        print("\nMost Similar Sections for Extracted Text:")
        for section, similarity in most_similar_sections_original:
            print("\nChapter:", section["Description"])
            print("\nSection:", section["IPC-Section"])
            print("\nSection Title:", section["Cognizable"])
            print("\nSection Description:", section["Punishment"])
            print("\nSimilarity Score:", similarity)
            print("\n")
            print("-" * 50)
            print("\n\n\n")
    else:
        print("No matching section found for the extracted text.")

    # Merged Code
    most_similar_sections_ocr = find_most_similar_sections(extracted_text, section_data, top_n=5)

    if most_similar_sections_ocr:
        print("\nTop Sections with Highest Similarity (OCR):")
        for section, similarity in most_similar_sections_ocr:
            print("\nChapter:", section["Description"])
            print("\nSection:", section["IPC-Section"])
            print("\nSection Title:", section["Cognizable"])
            print("\nSection Description:", section["Punishment"])
            print("\nSimilarity Score:", similarity)
            print("-" * 50)
            print("\n\n\n")
    else:
        print("No matching section found for the extracted text (OCR).")

if __name__ == "__main__":
    main()
