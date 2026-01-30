import React, { useCallback, useEffect, useState, useRef } from "react";
import { Pipette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- Utils ---

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 0, g: 0, b: 0 };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) => {
    return (
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    );
};

const rgbToHsv = ({ r, g, b }: { r: number; g: number; b: number }) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h = 0,
        s,
        v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToRgb = ({ h, s, v }: { h: number; s: number; v: number }) => {
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0,
        g = 0,
        b = 0;

    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (h >= 300 && h < 360) {
        r = c;
        g = 0;
        b = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
};

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

// --- Hooks ---

const useDraggable = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    onChange: (x: number, y: number) => void
) => {
    const onMove = useCallback(
        (event: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent) => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const isTouch = 'touches' in event;
            const clientX = isTouch ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
            const clientY = isTouch ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;

            const x = clamp((clientX - rect.left) / rect.width, 0, 1);
            const y = clamp((clientY - rect.top) / rect.height, 0, 1);

            onChange(x, y);
        },
        [containerRef, onChange]
    );

    const onUp = useCallback(() => {
        document.removeEventListener("mousemove", onMove as any);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchmove", onMove as any);
        document.removeEventListener("touchend", onUp);
    }, [onMove]);

    const onDown = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            // Prevent default to stop text selection, but allow focus
            // event.preventDefault(); 
            document.addEventListener("mousemove", onMove as any);
            document.addEventListener("mouseup", onUp);
            document.addEventListener("touchmove", onMove as any, { passive: false });
            document.addEventListener("touchend", onUp);
            onMove(event);
        },
        [onMove, onUp]
    );

    return { onDown };
};

// --- Components ---

const SaturationArea = ({
    hsv,
    onChange,
}: {
    hsv: { h: number; s: number; v: number };
    onChange: (hsv: { h: number; s: number; v: number }) => void;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleMove = (x: number, y: number) => {
        onChange({ ...hsv, s: x * 100, v: (1 - y) * 100 });
    };

    const { onDown } = useDraggable(ref, handleMove);

    const bgColor = hsvToRgb({ h: hsv.h, s: 100, v: 100 });
    const bgStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;

    return (
        <div
            ref={ref}
            className="relative w-full h-32 rounded-md overflow-hidden cursor-crosshair touch-none"
            style={{
                backgroundColor: bgStyle,
            }}
            onMouseDown={onDown}
            onTouchStart={onDown}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(to right, #fff, rgba(255,255,255,0))"
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(to top, #000, rgba(0,0,0,0))"
                }}
            />

            <div
                className="absolute w-3 h-3 border-2 border-white rounded-full shadow-sm -ml-1.5 -mt-1.5 pointer-events-none"
                style={{
                    left: `${hsv.s}%`,
                    top: `${100 - hsv.v}%`,
                    backgroundColor: rgbToHex(hsvToRgb(hsv))
                }}
            />
        </div>
    );
};

const HueSlider = ({
    hue,
    onChange,
}: {
    hue: number;
    onChange: (hue: number) => void;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleMove = (x: number) => {
        onChange(x * 360);
    };

    const { onDown } = useDraggable(ref, handleMove);

    return (
        <div
            ref={ref}
            className="relative flex-1 h-3 rounded bg-transparent cursor-pointer touch-none"
            onMouseDown={onDown}
            onTouchStart={onDown}
        >
            <div
                className="absolute inset-0 rounded"
                style={{
                    background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
                }}
            />
            <div
                className="absolute w-3 h-3 bg-white border border-border rounded-full shadow-sm -ml-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${(hue / 360) * 100}%` }}
            />
        </div>
    );
};

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    className?: string;
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
    // Initialize state
    const [hsv, setHsv] = useState(() => rgbToHsv(hexToRgb(color)));
    const [rgb, setRgb] = useState(() => hexToRgb(color));

    // Sync state when color prop changes
    useEffect(() => {
        const newRgb = hexToRgb(color);
        if (newRgb.r !== rgb.r || newRgb.g !== rgb.g || newRgb.b !== rgb.b) {
            setRgb(newRgb);
            setHsv(rgbToHsv(newRgb));
        }
    }, [color]);

    const updateColor = (newHsv: { h: number; s: number; v: number }) => {
        setHsv(newHsv);
        const newRgb = hsvToRgb(newHsv);
        setRgb(newRgb);
        onChange(rgbToHex(newRgb));
    };

    const handleHueChange = (newHue: number) => {
        updateColor({ ...hsv, h: newHue });
    };

    const handleRgbChange = (key: keyof typeof rgb, value: string) => {
        // allow empty for typing
        if (value === "") return; // Need to handle empty string in input? Input value is controlled.
        // We'll update state but not color if invalid?
        // Actually simpler: clamp immediately.
        let num = parseInt(value, 10);
        if (isNaN(num)) num = 0;
        num = clamp(num, 0, 255);

        const newRgb = { ...rgb, [key]: num };
        setRgb(newRgb);
        const newHsv = rgbToHsv(newRgb);
        setHsv(newHsv);
        onChange(rgbToHex(newRgb));
    };

    const handleEyeDropper = async () => {
        if (!window.EyeDropper) return;
        const eyeDropper = new window.EyeDropper();
        try {
            const result = await eyeDropper.open();
            const hex = result.sRGBHex;
            onChange(hex);
            // State updates in useEffect
        } catch (e) {
            // canceled
        }
    };

    return (
        <div className={cn("flex flex-col gap-3 w-60", className)}>
            {/* Saturation Box */}
            <SaturationArea hsv={hsv} onChange={updateColor} />

            {/* Controls Row */}
            <div className="flex items-center gap-3">
                {/* Eye Dropper */}
                {window.EyeDropper && (
                    <button
                        onClick={handleEyeDropper}
                        className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground"
                        title="Pick color from screen"
                    >
                        <Pipette className="w-4 h-4" />
                    </button>
                )}

                {/* Current Color Circle */}
                <div
                    className="w-6 h-6 rounded-full border border-border shrink-0 shadow-sm"
                    style={{ backgroundColor: rgbToHex(rgb) }}
                />

                {/* Hue Slider */}
                <HueSlider hue={hsv.h} onChange={handleHueChange} />
            </div>

            {/* RGB Inputs */}
            <div className="grid grid-cols-3 gap-2">
                {(['r', 'g', 'b'] as const).map((key) => (
                    <div key={key} className="flex flex-col gap-1 items-center">
                        <Input
                            value={rgb[key]}
                            onChange={(e) => handleRgbChange(key, e.target.value)}
                            className="h-8 text-center text-xs px-1"
                        />
                        <span className="text-[10px] text-muted-foreground uppercase">{key}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

declare global {
    interface Window {
        EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
    }
}
