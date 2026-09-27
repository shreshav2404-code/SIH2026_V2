"""Screenshot the running demo UI (http://localhost:5193) at 1600x900, 2x, for the deck and the video."""
import subprocess
from pathlib import Path

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUT = Path(__file__).resolve().parent.parent / "snapshots"
SHOTS = {
    "01_chat_help_en":      "chat?play=help&instant",
    "02_chat_threat_en":    "chat?play=threat&instant",
    "03_chat_sleep_en":     "chat?play=sleep&instant",
    "04_chat_travel_hi":    "chat?play=travel&instant&lang=hi",
    "05_chat_privacy_en":   "chat?play=privacy&instant",
    "06_chat_crisis_en":    "chat?play=crisis&instant",
    "07_chat_crisis_hi":    "chat?play=crisis&instant&lang=hi",
    "08_console_critical":  "console?case=A-1042&ack",
    "09_console_high":      "console?case=A-1039",
    "10_finetune":          "finetune",
}

def main():
    OUT.mkdir(exist_ok=True)
    for name, route in SHOTS.items():
        png = OUT / f"{name}.png"
        h = 1320 if name == "10_finetune" else 900
        subprocess.run([CHROME, "--headless", "--hide-scrollbars", "--force-device-scale-factor=2",
                        f"--window-size=1600,{h}", "--virtual-time-budget=6000",
                        f"--screenshot={png}", f"http://localhost:5193/#{route}"],
                       check=True, capture_output=True, timeout=120)
        print(name, png.stat().st_size // 1024, "KB")

if __name__ == "__main__":
    main()
