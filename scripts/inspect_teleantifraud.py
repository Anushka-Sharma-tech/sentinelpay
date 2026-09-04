import json
import re
from collections import Counter

p = "data/raw/transcripts/teleantifraud/sft/sft/train.jsonl"

labels = Counter()
scenes = Counter()
audio_examples = []

with open(p, encoding="utf-8") as f:
    for n, line in enumerate(f, 1):
        item = json.loads(line)

        labels[item.get("answers")] += 1

        if item.get("audios"):
            audio_examples.append(item["audios"][0])

        for msg in item.get("messages", []):
            if msg.get("role") != "assistant":
                continue

            content = msg.get("content", "")
            matches = re.findall(r'"scene"\s*:\s*"([^"]+)"', content)

            for scene in matches:
                scenes[scene] += 1

print("SFT TRAIN SAMPLES:", n)
print("LABELS:", labels)
print("SCENES:", scenes)
print("AUDIO EXAMPLES:")
for path in audio_examples[:5]:
    print(" ", path)
