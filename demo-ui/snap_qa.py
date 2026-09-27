"""Phone-only screenshots of each scripted Q&A, sized for the deck."""
import subprocess
from pathlib import Path

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUT = Path(__file__).resolve().parent.parent / "snapshots"
SHOTS = {
    "qa_help_en":    ("help", "en", 420),
    "qa_threat_en":  ("threat", "en", 450),
    "qa_sleep_en":   ("sleep", "en", 560),
    "qa_travel_hi":  ("travel", "hi", 500),
    "qa_privacy_en": ("privacy", "en", 360),
    "qa_crisis_en":  ("crisis", "en", 470),
    "qa_crisis_hi":  ("crisis", "hi", 480),
}
for name, (play, lang, h) in SHOTS.items():
    png = OUT / f"{name}.png"
    subprocess.run([CHROME, "--headless", "--hide-scrollbars", "--force-device-scale-factor=3",
                    f"--window-size=520,{h}", "--virtual-time-budget=6000", f"--screenshot={png}",
                    f"http://localhost:5193/#chat?solo&instant&play={play}&lang={lang}"],
                   check=True, capture_output=True, timeout=120)
    print(name, png.stat().st_size // 1024, "KB")
