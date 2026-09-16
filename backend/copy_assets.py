import shutil
import os

src_dir = r"C:\Users\kanak\.gemini\antigravity-ide\brain\fa1c56a3-a40f-4258-80ce-3c0ab11245e0"
dst_dir = r"c:\Users\kanak\OneDrive\Desktop\grok\frontend\src\assets\images"

os.makedirs(dst_dir, exist_ok=True)

mapping = {
    "earth_orbit_hero.jpg": "earth_orbit_hero_1789575461895.jpg",
    "rocket_launch_pad.jpg": "rocket_launch_pad_1789575500488.jpg",
    "solar_dynamics_sun.jpg": "solar_dynamics_sun_1789575544229.jpg",
    "debris_orbital_shell.jpg": "debris_orbital_shell_1789575626130.jpg",
    "propulsion_staging.jpg": "propulsion_staging_1789575739934.jpg",
    "coverage_footprint.jpg": "coverage_footprint_1789575850164.jpg"
}

for dst_name, src_name in mapping.items():
    s_path = os.path.join(src_dir, src_name)
    d_path = os.path.join(dst_dir, dst_name)
    if os.path.exists(s_path):
        shutil.copy2(s_path, d_path)
        print(f"Copied {dst_name} -> {d_path}")
    else:
        print(f"Source not found: {s_path}")

print("Assets copy complete.")
