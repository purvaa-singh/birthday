import os
from PIL import Image

def optimize_images(directory, max_size=(1600, 1600), quality=70):
    total_original_size = 0
    total_new_size = 0
    count = 0

    for root, _, files in os.walk(directory):
        if '.git' in root:
            continue
        for file in files:
            file_lower = file.lower()
            if file_lower.endswith(('.jpg', '.jpeg', '.png')):
                path = os.path.join(root, file)
                try:
                    original_size = os.path.getsize(path)
                    
                    img = Image.open(path)
                    
                    # Convert to RGB if it's RGBA and we are saving as JPEG 
                    # Actually we'll just compress in-place with PIL's optimize=True
                    # Since these are photos, we save as JPEG. But let's override with the original extension
                    format_to_save = img.format if img.format else "JPEG"
                    if format_to_save not in ["JPEG", "PNG"]:
                        format_to_save = "JPEG"
                        
                    # Fix orientation before resizing to prevent images appearing rotated
                    # Wait, rotation issue: PIL sometimes loses EXIF orientation if we don't handle it
                    try:
                        from PIL import ExifTags
                        for orientation in ExifTags.TAGS.keys():
                            if ExifTags.TAGS[orientation] == 'Orientation':
                                break
                        exif = img._getexif()
                        if exif is not None:
                            orientation_val = exif.get(orientation)
                            if orientation_val == 3:
                                img = img.rotate(180, expand=True)
                            elif orientation_val == 6:
                                img = img.rotate(270, expand=True)
                            elif orientation_val == 8:
                                img = img.rotate(90, expand=True)
                    except (AttributeError, KeyError, IndexError):
                        pass # no exif
                    
                    # Ensure RGB mode for JPEG
                    if format_to_save == "JPEG" and img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    
                    # Resize
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)
                    
                    # Save
                    if format_to_save == "JPEG":
                        img.save(path, "JPEG", optimize=True, quality=quality)
                    else:
                        img.save(path, format_to_save, optimize=True)
                        
                    new_size = os.path.getsize(path)
                    total_original_size += original_size
                    total_new_size += new_size
                    count += 1
                    print(f"Compressed {path}: {original_size // 1024}KB -> {new_size // 1024}KB")
                except Exception as e:
                    print(f"Failed to process {path}: {e}")

    print(f"\nOptimization complete! Processed {count} images.")
    if total_original_size > 0:
        print(f"Total size reduced from {total_original_size // (1024 * 1024)}MB to {total_new_size // (1024 * 1024)}MB")

if __name__ == "__main__":
    optimize_images(".")
