"""
ai_models.py — Lightweight Issue Verification using pure PIL + NumPy

Algorithm design for REAL pothole repair photos:
  - Fresh asphalt repair is DARKER than surrounding road, not lighter
  - Brightness-first scoring fails on real images
  - Instead we use:
    1. Pixel-level change detection  (did major work happen?)
    2. Local patch variance analysis (is the surface more uniform after?)
    3. Maximum local contrast drop   (deep pothole shadow disappears after fill)
    4. Edge density change           (crater rim edges disappear after fill)
"""
import logging
import numpy as np
from PIL import Image, ImageStat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ----------------------------------------------------------------
# Fake Image Detection  (purely statistical, no ML model needed)
# ----------------------------------------------------------------

def detect_fake_image(image: Image.Image) -> tuple[bool, float]:
    """
    Real photos have natural per-channel noise (stddev > 20).
    Purely synthetic/AI‑generated flat images have very low stddev.
    Returns (is_fake: bool, confidence: float)
    """
    try:
        stat = ImageStat.Stat(image)
        avg_std = sum(stat.stddev) / len(stat.stddev)

        if avg_std < 12.0:
            confidence = round(min(0.9, 0.65 + (12.0 - avg_std) / 12.0), 2)
            logger.info(f"[FakeDetect] avg_std={avg_std:.2f} → FAKE  (conf={confidence})")
            return True, confidence

        logger.info(f"[FakeDetect] avg_std={avg_std:.2f} → real  (conf=0.1)")
        return False, 0.10

    except Exception as e:
        logger.error(f"[FakeDetect] Error: {e}")
        return False, 0.0


# ----------------------------------------------------------------
# Helper: compute local patch variance map
# ----------------------------------------------------------------

def _local_variance_stats(gray_arr: np.ndarray, patch_size: int = 20) -> dict:
    """
    Splits the image into non-overlapping patches and returns statistics
    about the per-patch standard deviation distribution.
    """
    h, w = gray_arr.shape
    stds = []
    for i in range(0, h - patch_size, patch_size):
        for j in range(0, w - patch_size, patch_size):
            patch = gray_arr[i:i + patch_size, j:j + patch_size]
            stds.append(float(np.std(patch)))
    if not stds:
        return {"mean": 0.0, "max": 0.0, "p90": 0.0}
    arr = np.array(stds)
    return {
        "mean": float(np.mean(arr)),
        "max":  float(np.max(arr)),
        "p90":  float(np.percentile(arr, 90)),   # 90th percentile — how "spiky" is the texture?
    }


def _classify_issue_type(before_arr: np.ndarray) -> str:
    """Heuristically classify issue from before-image statistics."""
    lv = _local_variance_stats(before_arr)
    mean_bright = float(np.mean(before_arr))
    if lv["p90"] > 30 or lv["max"] > 60:
        return "pothole"
    if mean_bright < 80:
        return "waterlogging"
    return "road_damage"


# ----------------------------------------------------------------
# Main Vision Comparison
# ----------------------------------------------------------------

def verify_issue_resolution(before_image: Image.Image, after_image: Image.Image) -> dict:
    """
    Compares before/after civic repair images using four complementary signals:

    Signal 1 — CHANGE DETECTION (weight 0.30)
        Fraction of pixels that changed significantly between before/after.
        If a large area changed, repair work was likely done.

    Signal 2 — TEXTURE UNIFORMITY (weight 0.35)
        Mean local-patch std-dev.  A pothole creates high local variance
        around the crater.  After filling, the surface is more uniform
        (lower mean patch std-dev), even if dark.

    Signal 3 — MAX-CONTRAST DROP (weight 0.20)
        The 90th-percentile patch std-dev captures the "spikiest" region
        (the pothole crater).  This should drop after repair.

    Signal 4 — EDGE DENSITY CHANGE (weight 0.15)
        The crater rim creates strong gradient edges.  Filling flattens it.
    """
    try:
        SIZE = 256
        before_r = before_image.resize((SIZE, SIZE), Image.LANCZOS)
        after_r  = after_image.resize((SIZE, SIZE), Image.LANCZOS)

        b = np.array(before_r.convert("L"), dtype=np.float32)
        a = np.array(after_r.convert("L"),  dtype=np.float32)

        issue_type = _classify_issue_type(b)

        # ---- Signal 1: Change Detection ----
        # Pixels that changed by more than 15 intensity units = meaningful change
        diff = np.abs(a - b)
        changed_frac = float(np.mean(diff > 15))
        # We want large change (repair done), but cap at 1.0
        # A pothole fill typically changes 15–40% of pixels in real images
        change_score = float(np.clip(changed_frac / 0.25, 0.0, 1.0))

        # ---- Signal 2: Texture Uniformity (mean local std) ----
        lv_before = _local_variance_stats(b)
        lv_after  = _local_variance_stats(a)
        # Positive delta → before was rougher → repair smoothed it
        mean_smooth_delta = lv_before["mean"] - lv_after["mean"]
        smooth_score = float(np.clip(0.5 + mean_smooth_delta / 10.0, 0.0, 1.0))

        # ---- Signal 3: Max-Contrast Drop (90th pct patch std) ----
        p90_delta = lv_before["p90"] - lv_after["p90"]
        contrast_score = float(np.clip(0.5 + p90_delta / 15.0, 0.0, 1.0))

        # ---- Signal 4: Edge Density Change ----
        grad_b = (np.abs(np.diff(b, axis=0)).mean() + np.abs(np.diff(b, axis=1)).mean()) / 2.0
        grad_a = (np.abs(np.diff(a, axis=0)).mean() + np.abs(np.diff(a, axis=1)).mean()) / 2.0
        edge_delta = grad_b - grad_a
        edge_score = float(np.clip(0.5 + edge_delta / 3.0, 0.0, 1.0))

        logger.info(
            f"[Vision] issue_type={issue_type}\n"
            f"  change_score={change_score:.3f}  (changed_frac={changed_frac:.3f})\n"
            f"  smooth_score={smooth_score:.3f}  (delta_mean={mean_smooth_delta:.2f})\n"
            f"  contrast_score={contrast_score:.3f} (delta_p90={p90_delta:.2f})\n"
            f"  edge_score={edge_score:.3f}  (delta_grad={edge_delta:.3f})"
        )

        # Weighted combination
        confidence = (
            0.30 * change_score   +
            0.35 * smooth_score   +
            0.20 * contrast_score +
            0.15 * edge_score
        )
        confidence = round(float(np.clip(confidence, 0.0, 1.0)), 2)

        # Resolved if confidence > 0.55
        resolved = confidence > 0.55

        return {
            "issue_type": issue_type,
            "resolved":   resolved,
            "confidence": confidence,
            "message": (
                "Issue appears to be resolved based on visual analysis."
                if resolved else
                "Issue does not appear to be fully resolved."
            ),
        }

    except Exception as e:
        logger.error(f"[Vision] Analysis error: {e}")
        return {
            "issue_type": "unknown",
            "resolved":   False,
            "confidence": 0.0,
            "error":      f"Analysis failed: {str(e)}",
        }
