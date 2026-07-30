import os
from pathlib import Path
from PIL import Image

class AuroraOperations:
    @staticmethod
    def resize_image(input_path, output_path, width=800, height=600):
        try:
            with Image.open(input_path) as img:
                img_resized = img.resize((width, height))
                img_resized.save(output_path)
            print(f"Locally resized image saved to: {output_path}")
            return True
        except Exception as e:
            print(f"Error during image processing: {e}")
            return False

    @staticmethod
    def grayscale_image(input_path, output_path):
        try:
            with Image.open(input_path) as img:
                img_gray = img.convert("L")
                img_gray.save(output_path)
            print(f"Locally converted image to grayscale saved to: {output_path}")
            return True
        except Exception as e:
            print(f"Error during grayscale conversion: {e}")
            return False

if __name__ == "__main__":
    print("Aurora Operations module loaded.")
